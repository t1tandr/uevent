import {
	Injectable,
	BadRequestException,
	NotFoundException
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { UpdatePromoCodeDto } from '../dto/update-promocode.dto'

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

	async getEventPromoCodes(eventId: string) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: {
				promoCodes: true
			}
		})

		if (!event) {
			throw new NotFoundException('Event not found')
		}

		return event.promoCodes
	}

	async updatePromoCode(promoCodeId: string, dto: UpdatePromoCodeDto) {
		const exists = await this.prisma.promoCode.findUnique({
			where: { code: dto.code }
		})

		if (exists && exists.id !== promoCodeId) {
			throw new BadRequestException('Promo code already exists')
		}

		return this.prisma.promoCode.update({
			where: { id: promoCodeId },
			data: {
				code: dto.code,
				discount: dto.discount
			}
		})
	}

	async deletePromoCode(promoCodeId: string) {
		const promoCode = await this.prisma.promoCode.findUnique({
			where: { id: promoCodeId }
		})

		if (!promoCode) {
			throw new NotFoundException('Promo code not found')
		}

		return this.prisma.promoCode.delete({
			where: { id: promoCodeId }
		})
	}
}
