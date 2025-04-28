import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class PromoCodeService {
	constructor(private prisma: PrismaService) {}

	async create(eventId: string, code: string, discount: number) {
		const exists = await this.prisma.promoCode.findUnique({
			where: { code }
		})

		if (exists) {
			throw new BadRequestException('Promo code already exists')
		}

		return this.prisma.promoCode.create({
			data: {
				code,
				discount,
				eventId
			}
		})
	}

	async validate(code: string, eventId: string) {
		const promoCode = await this.prisma.promoCode.findFirst({
			where: {
				code,
				eventId,
				isUsed: false
			}
		})

		if (!promoCode) {
			throw new BadRequestException('Invalid or used promo code')
		}

		return promoCode
	}
}
