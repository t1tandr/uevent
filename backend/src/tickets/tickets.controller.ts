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
import { CreateTicketDto } from './dto/create-ticket.dto'
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard'

@Controller('tickets')
export class TicketsController {
	constructor(private readonly ticketsService: TicketsService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	async createTicket(
		@CurrentUser('id') userId: string,
		@Body() dto: CreateTicketDto
	) {
		return this.ticketsService.createTicket(userId, dto.eventId, dto.promoCode)
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getTickets(@CurrentUser('id') userId: string) {
		return this.ticketsService.getTickets(userId)
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
