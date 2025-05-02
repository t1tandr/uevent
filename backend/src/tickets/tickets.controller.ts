import {
	Controller,
	Post,
	Get,
	Body,
	Param,
	UseGuards,
	Res
} from '@nestjs/common'
import { Response } from 'express'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { TicketsService } from './tickets.service'
import { PaymentsService } from './payments.service'
import { CreateTicketDto } from './dto/create-ticket.dto'
import { JwtAuthGuard } from '../auth/guard/jwt.guard'

@Controller('tickets')
export class TicketsController {
	constructor(
		private readonly ticketsService: TicketsService,
		private readonly paymentsService: PaymentsService
	) {}

	@Post('checkout')
	@UseGuards(JwtAuthGuard)
	async initiateCheckout(
		@CurrentUser('id') userId: string,
		@Body() dto: CreateTicketDto
	) {
		return this.paymentsService.createCheckoutSession(
			userId,
			dto.eventId,
			dto.promoCode
		)
	}

	@Post('confirm')
	@UseGuards(JwtAuthGuard)
	async confirmPayment(@Body() data: { sessionId: string }) {
		return this.paymentsService.handleSuccessfulPayment(data.sessionId)
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getTickets(@CurrentUser('id') userId: string) {
		return this.ticketsService.getTickets(userId)
	}

	@Get('check/:eventId')
	@UseGuards(JwtAuthGuard)
	async checkEventTicket(
		@CurrentUser('id') userId: string,
		@Param('eventId') eventId: string
	) {
		return this.ticketsService.checkUserHasEventTicket(userId, eventId)
	}

	@Get(':id/pdf')
	@UseGuards(JwtAuthGuard)
	async downloadTicket(@Param('id') ticketId: string, @Res() res: Response) {
		const pdf = await this.ticketsService.generateTicketPDF(ticketId)

		res.setHeader('Content-Type', 'application/pdf')
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="ticket-${ticketId}.pdf"`
		)
		res.send(pdf)
	}
}
