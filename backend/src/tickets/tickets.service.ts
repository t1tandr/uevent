import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { Ticket } from '@prisma/client'
import * as qrcode from 'qrcode'
import { PaymentsService } from './payments.service'
import { PDFService } from './pdf.service'
import { MailService } from 'src/mail/mail.service'
import { NotificationsService } from 'src/notifications/notifications.service'

@Injectable()
export class TicketsService {
	constructor(
		private prisma: PrismaService,
		private paymentsService: PaymentsService,
		private pdfService: PDFService,
		private readonly notificationsService: NotificationsService,

		private mailService: MailService
	) {}

	async checkUserHasEventTicket(
		userId: string,
		eventId: string
	): Promise<{ hasTicket: boolean }> {
		const ticket = await this.prisma.ticket.findFirst({
			where: {
				userId,
				eventId,
				status: 'ACTIVE'
			}
		})

		return { hasTicket: !!ticket }
	}

	async getTickets(userId: string): Promise<Ticket[]> {
		return this.prisma.ticket.findMany({
			where: { userId },
			include: {
				event: true,
				user: true
			}
		})
	}

	// async createTicket(
	// 	userId: string,
	// 	eventId: string,
	// 	promoCode?: string
	// ): Promise<{ ticket: Ticket; paymentUrl: string }> {
	// 	const event = await this.prisma.event.findUnique({
	// 		where: { id: eventId },
	// 		include: { attendees: true }
	// 	})

	// 	if (!event) {
	// 		throw new NotFoundException('Event not found')
	// 	}

	// 	if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
	// 		throw new BadRequestException('Event is full')
	// 	}

	// 	let ticketPrice = event.price

	// 	if (promoCode) {
	// 		const code = await this.prisma.promoCode.findFirst({
	// 			where: { code: promoCode, eventId, isUsed: false }
	// 		})

	// 		if (code) {
	// 			ticketPrice = ticketPrice * (1 - code.discount)
	// 			await this.prisma.promoCode.update({
	// 				where: { id: code.id },
	// 				data: { isUsed: true }
	// 			})
	// 		}
	// 	}

	// 	const ticket = await this.prisma.ticket.create({
	// 		data: {
	// 			eventId,
	// 			userId,
	// 			price: ticketPrice,
	// 			qrCode: await this.generateQRCode(eventId, userId)
	// 		},
	// 		include: {
	// 			user: true,
	// 			event: true
	// 		}
	// 	})

	// 	await this.mailService.sendTicketConfirmation(
	// 		ticket.user,
	// 		ticket.event,
	// 		ticket
	// 	)

	// 	const paymentUrl = await this.paymentsService.createPaymentSession(
	// 		ticket.id,
	// 		ticketPrice
	// 	)

	// 	return { ticket, paymentUrl }
	// }

	private async generateQRCode(
		eventId: string,
		userId: string
	): Promise<string> {
		const data = JSON.stringify({ eventId, userId, timestamp: Date.now() })
		return qrcode.toDataURL(data)
	}

	async generateTicketPDF(ticketId: string): Promise<Buffer> {
		const ticket = await this.prisma.ticket.findUnique({
			where: { id: ticketId },
			include: {
				event: true,
				user: true
			}
		})

		if (!ticket) {
			throw new NotFoundException('Ticket not found')
		}

		return this.pdfService.generateTicket(ticket)
	}
}
