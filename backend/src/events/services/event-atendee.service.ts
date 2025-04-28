import { Injectable, BadRequestException } from '@nestjs/common'
import { TicketStatus } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class EventAttendeeService {
	constructor(private prisma: PrismaService) {}

	async addAttendee(eventId: string, userId: string, promoCode?: string) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: {
				attendees: true,
				promoCodes: {
					where: {
						code: promoCode,
						isUsed: false
					}
				}
			}
		})

		if (!event) {
			throw new BadRequestException('Event not found')
		}

		if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
			throw new BadRequestException('Event is full')
		}

		let price = event.price
		let usedPromoCode = null

		if (promoCode) {
			usedPromoCode = event.promoCodes[0]
			if (usedPromoCode) {
				price = price * (1 - usedPromoCode.discount)
			}
		}

		return this.prisma.$transaction(async tx => {
			if (usedPromoCode) {
				await tx.promoCode.update({
					where: { id: usedPromoCode.id },
					data: { isUsed: true }
				})
			}

			return tx.ticket.create({
				data: {
					eventId,
					userId,
					price,
					status: TicketStatus.ACTIVE
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							avatarUrl: true
						}
					}
				}
			})
		})
	}

	async removeAttendee(eventId: string, userId: string) {
		return this.prisma.ticket.updateMany({
			where: {
				eventId,
				userId,
				status: TicketStatus.ACTIVE
			},
			data: {
				status: TicketStatus.CANCELLED
			}
		})
	}

	async getEventAttendees(
		eventId: string,
		filter?: {
			status?: TicketStatus
			searchTerm?: string
		}
	) {
		return this.prisma.ticket.findMany({
			where: {
				eventId,
				status: filter?.status || TicketStatus.ACTIVE,
				user: filter?.searchTerm
					? {
							OR: [
								{ name: { contains: filter.searchTerm, mode: 'insensitive' } },
								{ email: { contains: filter.searchTerm, mode: 'insensitive' } }
							]
						}
					: undefined
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
						avatarUrl: true
					}
				},
				Payment: {
					select: {
						status: true,
						amount: true,
						createdAt: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
	}

	async getAttendeesStatistics(eventId: string) {
		const [tickets, totalAmount] = await Promise.all([
			this.prisma.ticket.groupBy({
				by: ['status'],
				where: { eventId },
				_count: true
			}),
			this.prisma.ticket.aggregate({
				where: {
					eventId,
					status: TicketStatus.ACTIVE
				},
				_sum: {
					price: true
				}
			})
		])

		return {
			statistics: tickets.reduce(
				(acc, curr) => ({
					...acc,
					[curr.status]: curr._count
				}),
				{}
			),
			totalAmount: totalAmount._sum.price || 0
		}
	}
}
