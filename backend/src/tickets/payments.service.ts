import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PaymentStatus } from '@prisma/client'
import { MailService } from 'src/mail/mail.service'

@Injectable()
export class PaymentsService {
	constructor(
		private prisma: PrismaService,
		private readonly mailService: MailService
	) {}

	async createPaymentSession(
		ticketId: string,
		amount: number
	): Promise<string> {
		// In real implementation, this would create a payment session with a payment provider
		const payment = await this.prisma.payment.create({
			data: {
				ticketId,
				amount,
				status: PaymentStatus.PENDING,
				userId: (
					await this.prisma.ticket.findUnique({
						where: { id: ticketId },
						select: { userId: true }
					})
				).userId,
				details: {
					sessionId: `fake_session_${Date.now()}`
				}
			}
		})

		// Return fake payment URL
		return `http://localhost:3000/payments/process/${payment.id}`
	}

	async processPayment(paymentId: string): Promise<void> {
		const payment = await this.prisma.payment.findUnique({
			where: { id: paymentId },
			include: {
				ticket: {
					include: {
						event: true,
						user: true
					}
				}
			}
		})

		// Simulate payment processing
		await new Promise(resolve => setTimeout(resolve, 2000))

		await this.prisma.payment.update({
			where: { id: paymentId },
			data: { status: PaymentStatus.COMPLETED }
		})

		// Send payment confirmation email
		await this.mailService.sendPaymentConfirmation(
			payment.ticket.user,
			payment.ticket.event,
			payment.amount
		)
	}
}
