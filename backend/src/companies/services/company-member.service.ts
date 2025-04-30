import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { AddMemberDto } from '../dto/add-member.dto'
import { CompanyRole } from '@prisma/client'

@Injectable()
export class CompanyMembersService {
	constructor(private prisma: PrismaService) {}

	async addMember(companyId: string, dto: AddMemberDto) {
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

	async updateMemberRole(memberId: string, newRole: CompanyRole) {
		const member = await this.prisma.companyMember.findUnique({
			where: { id: memberId }
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

	async removeMember(memberId: string) {
		const member = await this.prisma.companyMember.findUnique({
			where: { id: memberId }
		})

		if (!member) throw new NotFoundException('Member not found')
		if (member.role === CompanyRole.OWNER) {
			throw new ForbiddenException('Cannot remove owner')
		}

		return this.prisma.companyMember.delete({
			where: { id: memberId }
		})
	}
}
