import { Injectable, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma.service'
import { MailService } from '../mail/mail.service'
import { NotificationsService } from '../notifications/notifications.service'
import * as qrcode from 'qrcode'
import Stripe from 'stripe'
import { PDFService } from './pdf.service'

@Injectable()
export class PaymentsService {
	private stripe: Stripe

	constructor(
		private prisma: PrismaService,
		private configService: ConfigService,
		private mailService: MailService,
		private notificationsService: NotificationsService,
		private pdfService: PDFService
	) {
		this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
			apiVersion: '2025-04-30.basil'
		})
	}

	async createCheckoutSession(
		userId: string,
		eventId: string,
		promoCode?: string
	) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: {
				attendees: true,
				Company: true
			}
		})

		if (!event) {
			throw new BadRequestException('Event not found')
		}

		if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
			throw new BadRequestException('Event is full')
		}

		const existingTicket = await this.prisma.ticket.findFirst({
			where: {
				userId,
				eventId,
				status: 'ACTIVE'
			}
		})

		if (existingTicket) {
			throw new BadRequestException('You already have a ticket for this event')
		}

		let ticketPrice = event.price

		if (promoCode) {
			const code = await this.prisma.promoCode.findFirst({
				where: { code: promoCode, eventId, isUsed: false }
			})

			if (code) {
				ticketPrice = ticketPrice * (1 - code.discount / 100)
			}
		}

		const session = await this.stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: event.title,
							description: `Ticket for ${event.title}`,
							images:
								event.imagesUrls && event.imagesUrls.length > 0
									? [event.imagesUrls[0]]
									: []
						},
						unit_amount: Math.round(ticketPrice * 100)
					},
					quantity: 1
				}
			],
			mode: 'payment',
			success_url: `${this.configService.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${this.configService.get('FRONTEND_URL')}/event/${eventId}`,
			metadata: {
				userId,
				eventId,
				promoCode,
				ticketPrice: ticketPrice.toString(),
				organizerId: event.organizerId,
				companyId: event.companyId
			}
		})

		return { url: session.url, sessionId: session.id }
	}

	async handleSuccessfulPayment(sessionId: string) {
		try {
			const session = await this.stripe.checkout.sessions.retrieve(sessionId)

			if (session.payment_status !== 'paid') {
				throw new BadRequestException('Payment not completed')
			}

			const existingPayment = await this.prisma.payment.findFirst({
				where: {
					details: {
						path: ['stripeSessionId'],
						equals: sessionId
					}
				},
				include: {
					ticket: {
						include: {
							event: true,
							user: true
						}
					}
				}
			})

			if (existingPayment) {
				console.log(
					`Payment with session ID ${sessionId} already processed. Returning existing ticket.`
				)
				return existingPayment.ticket
			}

			const { userId, eventId, promoCode, ticketPrice } = session.metadata

			return await this.prisma.$transaction(async tx => {
				const existingTicket = await tx.ticket.findFirst({
					where: {
						eventId,
						userId,
						status: 'ACTIVE'
					},
					include: {
						event: true,
						user: true
					}
				})

				if (existingTicket) {
					console.log(
						`User ${userId} already has an active ticket for event ${eventId}. Not creating duplicate.`
					)
					return existingTicket
				}

				const qrData = JSON.stringify({
					eventId,
					userId,
					timestamp: Date.now()
				})
				const qrCodeUrl = await qrcode.toDataURL(qrData)

				const ticket = await tx.ticket.create({
					data: {
						eventId,
						userId,
						price: parseFloat(ticketPrice),
						status: 'ACTIVE',
						qrCode: qrCodeUrl
					},
					include: {
						event: {
							include: {
								organizer: true
							}
						},
						user: true
					}
				})

				if (promoCode) {
					await tx.promoCode.updateMany({
						where: { code: promoCode, eventId },
						data: { isUsed: true }
					})
				}

				await tx.payment.create({
					data: {
						ticketId: ticket.id,
						amount: parseFloat(ticketPrice),
						status: 'COMPLETED',
						userId,
						details: {
							stripeSessionId: sessionId
						}
					}
				})

				try {
					const pdfBuffer = await this.pdfService.generateTicket(ticket)

					await this.mailService.sendTicketConfirmation(
						ticket.user,
						ticket.event,
						ticket,
						pdfBuffer
					)

					console.log(
						`PDF ticket sent to ${ticket.user.email} for event ${ticket.event.title}`
					)

					await this.notificationsService.createTicketPurchasedNotification(
						ticket.id
					)

					if (ticket.event.notifyOrganizer) {
						await this.notificationsService.createNewAttendeeNotification(
							eventId,
							userId
						)
						console.log(
							`Organizer notification sent for new attendee to event ${ticket.event.title}`
						)
					}
				} catch (error) {
					console.error('Error sending notifications or email:', error)
				}

				return ticket
			})
		} catch (error) {
			console.error('Payment processing error:', error)
			throw new BadRequestException(
				'Failed to process payment: ' + (error.message || 'Unknown error')
			)
		}
	}
}
