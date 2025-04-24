import { Injectable, NotFoundException } from '@nestjs/common'
import { Provider } from '@prisma/client'
import { hash } from 'argon2'
import { RegisterDto } from 'src/auth/dto/register.dto'
import { PrismaService } from 'src/prisma.service'
import { S3Service } from 'src/s3/s3.service'
import { UserProfile } from './types/user.types'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private s3Service: S3Service
	) {}

	async getById(id: string) {
		return this.prisma.user.findUnique({
			where: {
				id
			}
		})
	}

	async getByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: {
				email
			}
		})
	}

	async createOAuthUser(data: {
		email: string
		name?: string
		avatarUrl?: string
		provider: Provider
	}) {
		return this.prisma.user.create({
			data: {
				email: data.email,
				name: data.name,
				avatarUrl: data.avatarUrl,
				provider: data.provider,
				password: ''
			}
		})
	}

	async create(dto: RegisterDto) {
		const user = {
			email: dto.email,
			password: await hash(dto.password),
			name: dto?.name
		}

		return this.prisma.user.create({
			data: user
		})
	}

	async updateAvatar(userId: string, file: Express.Multer.File) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId
			}
		})

		if (user.avatarUrl) {
			await this.s3Service.deleteFile(user.avatarUrl)
		}

		const avatarUrl = await this.s3Service.uploadFile(file, `avatars`)

		return this.prisma.user.update({
			where: {
				id: userId
			},
			data: {
				avatarUrl
			}
		})
	}

	async getProfile(userId: string): Promise<UserProfile> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				avatarUrl: true,
				events: {
					include: {
						Category: true,
						Company: true
					}
				},
				tickets: {
					include: {
						event: true
					}
				},
				companies: {
					select: {
						id: true,
						createdAt: true,
						userId: true,
						companyId: true,
						role: true
					}
				},
				subscriptions: {
					select: {
						company: {
							select: {
								id: true,
								name: true,
								logoUrl: true
							}
						}
					}
				}
			}
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const now = new Date()

		const upcomingEvents = user.tickets
			.filter(ticket => new Date(ticket.event.date) > now)
			.map(ticket => ticket.event)

		const pastEvents = user.tickets
			.filter(ticket => new Date(ticket.event.date) <= now)
			.map(ticket => ticket.event)

		return {
			...user,
			upcomingEvents,
			pastEvents,
			subscribedCompanies: user.subscriptions.map(sub => sub.company)
		}
	}

	async updateProfile(userId: string, dto: UpdateUserDto) {
		const user = await this.getById(userId)

		if (!user) {
			throw new NotFoundException('User not found')
		}

		return this.prisma.user.update({
			where: { id: userId },
			data: {
				name: dto.name,
				email: dto.email
			}
		})
	}

	async getPublicProfile(userId: string) {
		const profile = await this.getProfile(userId)

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { email, ...publicProfile } = profile

		return publicProfile
	}
}
