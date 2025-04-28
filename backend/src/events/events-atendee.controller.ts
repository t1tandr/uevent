import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { TicketStatus } from '@prisma/client'
import { AuthGuard } from 'src/auth/decorators/auth.decorator'
import { EventOrganizerGuard } from './guards/event-organizer.guard'
import { EventAttendeeService } from './services/event-atendee.service'

@Controller('events/:eventId/attendees')
@UseGuards(AuthGuard, EventOrganizerGuard)
export class EventAttendeeController {
	constructor(private readonly attendeeService: EventAttendeeService) {}

	@Get()
	async getEventAttendees(
		@Param('eventId') eventId: string,
		@Query('status') status?: TicketStatus,
		@Query('search') searchTerm?: string
	) {
		return this.attendeeService.getEventAttendees(eventId, {
			status,
			searchTerm
		})
	}

	@Get('statistics')
	async getAttendeesStatistics(@Param('eventId') eventId: string) {
		return this.attendeeService.getAttendeesStatistics(eventId)
	}
}
