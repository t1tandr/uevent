import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'

import { CompanyRole, EventStatus, Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { S3Service } from 'src/s3/s3.service'
import { CreateCompanyDto } from '../dto/create-company.dto'
import { UpdateCompanyDto } from '../dto/update-company.dto'
import { AddMemberDto } from '../dto/add-member.dto'
import { CompanyDetails, CompanyMemberDetails } from '../types/company.types'

@Injectable()
export class CompaniesService {
	constructor(
		private prisma: PrismaService,
		private s3Service: S3Service
	) {}

	async getCompanyEvents(
		companyId: string,
		options?: { status?: EventStatus; search?: string }
	) {
		const where: Prisma.EventWhereInput = {
			companyId,
			...(options?.status && { status: options.status }),
			...(options?.search && {
				OR: [
					{ title: { contains: options.search, mode: 'insensitive' } },
					{ description: { contains: options.search, mode: 'insensitive' } }
				]
			})
		}

		return this.prisma.event.findMany({
			where,
			include: {
				Category: true,
				_count: {
					select: {
						attendees: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
	}

	async getCompanyMembers(companyId: string, role?: CompanyRole) {
		return this.prisma.companyMember.findMany({
			where: {
				companyId,
				...(role && { role })
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						avatarUrl: true
					}
				}
			}
		})
	}

	async create(
		userId: string,
		dto: CreateCompanyDto,
		logo?: Express.Multer.File
	) {
		let logoUrl: string | undefined

		console.log(userId)

		if (logo) {
			logoUrl = await this.s3Service.uploadFile(logo, 'company-logos')
		}

		const company = await this.prisma.company.create({
			data: {
				...dto,
				logoUrl,
				members: {
					create: {
						userId,
						role: CompanyRole.OWNER
					}
				}
			},
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								avatarUrl: true
							}
						}
					}
				}
			}
		})

		return company
	}

	async findAll() {
		return this.prisma.company.findMany({
			include: {
				_count: {
					select: {
						subscribers: true
					}
				}
			}
		})
	}

	async findOne(id: string): Promise<CompanyDetails> {
		const company = await this.prisma.company.findUnique({
			where: { id },
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								avatarUrl: true
							}
						}
					}
				},
				events: true,
				_count: {
					select: {
						subscribers: true
					}
				}
			}
		})

		if (!company) throw new NotFoundException('Company not found')

		return company
	}

	async update(companyId: string, userId: string, dto: UpdateCompanyDto) {
		await this.checkUserRole(companyId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])

		return this.prisma.company.update({
			where: { id: companyId },
			data: dto
		})
	}

	async updateLogo(
		companyId: string,
		userId: string,
		file: Express.Multer.File
	) {
		await this.checkUserRole(companyId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])

		const company = await this.findOne(companyId)

		if (company.logoUrl) {
			await this.s3Service.deleteFile(company.logoUrl)
		}

		const logoUrl = await this.s3Service.uploadFile(file, 'company-logos')

		return this.prisma.company.update({
			where: { id: companyId },
			data: { logoUrl }
		})
	}

	async addMember(companyId: string, userId: string, dto: AddMemberDto) {
		await this.checkUserRole(companyId, userId, [CompanyRole.OWNER])

		const user = await this.prisma.user.findUnique({
			where: { email: dto.email }
		})

		if (!user) throw new NotFoundException('User not found')

		const existingMember = await this.prisma.companyMember.findFirst({
			where: {
				companyId,
				userId: user.id
			}
		})

		if (existingMember) {
			throw new BadRequestException('User is already a member')
		}

		return this.prisma.companyMember.create({
			data: {
				companyId,
				userId: user.id,
				role: dto.role
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						avatarUrl: true
					}
				}
			}
		})
	}

	async updateMemberRole(
		companyId: string,
		memberId: string,
		requesterId: string,
		newRole: CompanyRole
	) {
		await this.checkUserRole(companyId, requesterId, [CompanyRole.OWNER])

		const member = await this.prisma.companyMember.findFirst({
			where: {
				id: memberId,
				companyId
			}
		})

		if (!member) throw new NotFoundException('Member not found')

		if (member.role === CompanyRole.OWNER) {
			throw new ForbiddenException('Cannot change owner role')
		}

		return this.prisma.companyMember.update({
			where: { id: memberId },
			data: { role: newRole },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						avatarUrl: true
					}
				}
			}
		})
	}

	async removeMember(companyId: string, memberId: string, requesterId: string) {
		await this.checkUserRole(companyId, requesterId, [CompanyRole.OWNER])

		const member = await this.prisma.companyMember.findFirst({
			where: {
				id: memberId,
				companyId
			}
		})

		if (!member) throw new NotFoundException('Member not found')

		if (member.role === CompanyRole.OWNER) {
			throw new ForbiddenException('Cannot remove owner')
		}

		return this.prisma.companyMember.delete({
			where: { id: memberId }
		})
	}

	async subscribe(companyId: string, userId: string) {
		const exists = await this.prisma.subscriber.findFirst({
			where: {
				companyId,
				userId
			}
		})

		if (exists) {
			throw new BadRequestException('Already subscribed')
		}

		return this.prisma.subscriber.create({
			data: {
				companyId,
				userId
			}
		})
	}

	async unsubscribe(companyId: string, userId: string) {
		return this.prisma.subscriber.deleteMany({
			where: {
				companyId,
				userId
			}
		})
	}

	async getSubscribers(
		companyId: string
	): Promise<Omit<CompanyMemberDetails, 'role'>[]> {
		return this.prisma.subscriber.findMany({
			where: { companyId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						avatarUrl: true
					}
				}
			}
		})
	}

	private async checkUserRole(
		companyId: string,
		userId: string,
		allowedRoles: CompanyRole[]
	) {
		const member = await this.prisma.companyMember.findFirst({
			where: {
				companyId,
				userId
			}
		})

		if (!member || !allowedRoles.includes(member.role)) {
			throw new ForbiddenException('Insufficient permissions')
		}

		return member
	}
}
