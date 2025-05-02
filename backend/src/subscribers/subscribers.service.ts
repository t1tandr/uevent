import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class SubscribersService {
	constructor(private prisma: PrismaService) {}

	async subscribeToCompany(userId: string, companyId: string) {
		const company = await this.prisma.company.findUnique({
			where: { id: companyId }
		})

		if (!company) {
			throw new NotFoundException('Company not found')
		}

		return this.prisma.subscriber.create({
			data: {
				userId,
				companyId
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

	async unsubscribeFromCompany(userId: string, companyId: string) {
		const subscription = await this.prisma.subscriber.findFirst({
			where: {
				userId,
				companyId
			}
		})

		if (!subscription) {
			throw new NotFoundException('Subscription not found')
		}

		return this.prisma.subscriber.delete({
			where: { id: subscription.id }
		})
	}

	async isSubscribed(userId: string, companyId: string) {
		const subscription = await this.prisma.subscriber.findFirst({
			where: {
				userId,
				companyId
			}
		})

		return { isSubscribed: !!subscription }
	}

	async getCompanySubscribers(companyId: string) {
		const company = await this.prisma.company.findUnique({
			where: { id: companyId }
		})

		if (!company) {
			throw new NotFoundException('Company not found')
		}

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

	async getUserSubscriptions(userId: string) {
		return this.prisma.subscriber.findMany({
			where: { userId },
			include: {
				company: true
			}
		})
	}

	async getSubscribersCount(companyId: string) {
		return this.prisma.subscriber.count({
			where: { companyId }
		})
	}
}
