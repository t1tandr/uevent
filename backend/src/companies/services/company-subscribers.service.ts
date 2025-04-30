import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class CompanySubscribersService {
	constructor(private prisma: PrismaService) {}

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

	async getSubscribers(companyId: string) {
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
}
