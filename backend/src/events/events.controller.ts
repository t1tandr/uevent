import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	UseInterceptors,
	UploadedFiles,
	ParseFilePipe,
	MaxFileSizeValidator,
	FileTypeValidator,
	DefaultValuePipe,
	ParseIntPipe,
	ParseFloatPipe,
	UseGuards,
	Patch
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { EventsService } from './services/events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { EventFilters, SearchOptions } from './types/event.types'
import { CompanyRole, TicketStatus } from '@prisma/client'
import { EventAttendeeService } from './services/event-atendee.service'
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard'
import { PromoCodeService } from './services/promo-code.service'
import { UpdatePromoCodeDto } from './dto/update-promocode.dto'
import { UpdateEventDto } from './dto/update-event.dto'

@Controller('events')
export class EventsController {
	constructor(
		private readonly eventsService: EventsService,
		private readonly attendeeService: EventAttendeeService,
		private readonly promoCodeService: PromoCodeService
	) {}

	@Get('user')
	@UseGuards(JwtAuthGuard)
	async getMyEvents(@CurrentUser('id') userId: string) {
		return this.eventsService.getMyEvents(userId)
	}

	@Post()
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FilesInterceptor('images', 10))
	async create(
		@CurrentUser('id') userId: string,
		@Body() dto: CreateEventDto,
		@UploadedFiles(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
					new FileTypeValidator({ fileType: 'image/jpeg|image/png|image/webp' })
				],
				fileIsRequired: false
			})
		)
		files?: Express.Multer.File[]
	) {
		return this.eventsService.create(userId, dto, files)
	}

	@Get()
	async findAll(
		@Query('search') search?: string,
		@Query('format') format?: string,
		@Query('theme') theme?: string,
		@Query('date') date?: string,
		@Query('priceMin', ParseFloatPipe) priceMin?: number,
		@Query('priceMax', ParseFloatPipe) priceMax?: number,
		@Query('category') category?: string
	) {
		const filters: EventFilters = {
			search,
			format,
			theme,
			date: date ? new Date(date) : undefined,
			priceMin,
			priceMax,
			category
		}
		return this.eventsService.findAll(filters)
	}

	@Get('search')
	async searchEvents(
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc',
		@Query('search') search?: string,
		@Query('format') format?: string,
		@Query('theme') theme?: string,
		@Query('date') date?: string,
		@Query(
			'priceMin',
			new DefaultValuePipe(undefined),
			new ParseFloatPipe({ optional: true })
		)
		priceMin?: number,
		@Query(
			'priceMax',
			new DefaultValuePipe(undefined),
			new ParseFloatPipe({ optional: true })
		)
		priceMax?: number,
		@Query('category') category?: string,
		@Query('location') location?: string
	) {
		const filters: EventFilters = {
			search,
			format,
			theme,
			date: date ? new Date(date) : undefined,
			priceMin,
			priceMax,
			category,
			location
		}
		const options: SearchOptions = {
			page,
			limit,
			sortBy: sortBy as 'date' | 'price' | 'popularity',
			sortOrder: sortOrder as 'asc' | 'desc'
		}
		return this.eventsService.searchEvents(filters, options)
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.eventsService.findOne(id)
	}

	@Put(':id/images')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FilesInterceptor('images', 10))
	async updateImages(
		@Param('id') eventId: string,
		@CurrentUser('id') userId: string,
		@UploadedFiles(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
					new FileTypeValidator({ fileType: 'image/jpeg|image/png|image/webp' })
				],
				fileIsRequired: false
			})
		)
		files: Express.Multer.File[],
		@Body('imagesToDelete') imagesToDelete?: string[]
	) {
		await this.eventsService.checkEventAccess(eventId, userId, [])
		return this.eventsService.updateEventImages(eventId, files, imagesToDelete)
	}

	@Delete(':id/images')
	@UseGuards(JwtAuthGuard)
	async deleteImages(
		@Param('id') eventId: string,
		@CurrentUser('id') userId: string,
		@Body('imageUrls') imageUrls: string[]
	) {
		await this.eventsService.checkEventAccess(eventId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])
		return this.eventsService.updateEventImages(eventId, [], imageUrls)
	}

	@Get(':eventId/attendees')
	@UseGuards(JwtAuthGuard)
	async getEventAttendees(
		@Param('eventId') eventId: string,
		@CurrentUser('id') userId: string,
		@Query('status') status?: TicketStatus,
		@Query('search') searchTerm?: string
	) {
		await this.eventsService.checkEventAccess(eventId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])
		return this.attendeeService.getEventAttendees(eventId, {
			status,
			searchTerm
		})
	}

	@Get(':eventId/attendees/statistics')
	@UseGuards(JwtAuthGuard)
	async getAttendeesStatistics(
		@Param('eventId') eventId: string,
		@CurrentUser('id') userId: string
	) {
		await this.eventsService.checkEventAccess(eventId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])
		return this.attendeeService.getAttendeesStatistics(eventId)
	}

	@Post(':id/cancel')
	@UseGuards(JwtAuthGuard)
	async cancelEvent(
		@Param('id') eventId: string,
		@CurrentUser('id') userId: string
	) {
		await this.eventsService.checkEventAccess(eventId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])
		return this.eventsService.cancelEvent(eventId)
	}

	@Get(':eventId/promo-codes')
	@UseGuards(JwtAuthGuard)
	async getEventPromoCodes(
		@Param('eventId') eventId: string,
		@CurrentUser('id') userId: string
	) {
		await this.eventsService.checkEventAccess(eventId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])
		return this.promoCodeService.getEventPromoCodes(eventId)
	}

	@Post(':eventId/promo-codes')
	@UseGuards(JwtAuthGuard)
	async createPromoCode(
		@Param('eventId') eventId: string,
		@CurrentUser('id') userId: string,
		@Body('code') code: string,
		@Body('discount') discount: number
	) {
		await this.eventsService.checkEventAccess(eventId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])
		return this.promoCodeService.create(eventId, code, discount)
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	async updateEvent(
		@Param('id') eventId: string,
		@CurrentUser('id') userId: string,
		@Body() dto: UpdateEventDto
	) {
		await this.eventsService.checkEventAccess(eventId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])
		return this.eventsService.updateEvent(eventId, userId, dto)
	}

	@Patch(':eventId/promo-codes/:promoCodeId')
	@UseGuards(JwtAuthGuard)
	async updatePromoCode(
		@Param('eventId') eventId: string,
		@Param('promoCodeId') promoCodeId: string,
		@CurrentUser('id') userId: string,
		@Body() dto: UpdatePromoCodeDto
	) {
		await this.eventsService.checkEventAccess(eventId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])
		return this.promoCodeService.updatePromoCode(promoCodeId, dto)
	}

	@Delete(':eventId/promo-codes/:promoCodeId')
	@UseGuards(JwtAuthGuard)
	async deletePromoCode(
		@Param('eventId') eventId: string,
		@Param('promoCodeId') promoCodeId: string,
		@CurrentUser('id') userId: string
	) {
		await this.eventsService.checkEventAccess(eventId, userId, [
			CompanyRole.OWNER,
			CompanyRole.EDITOR
		])
		return this.promoCodeService.deletePromoCode(promoCodeId)
	}
}
