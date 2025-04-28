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
	ForbiddenException
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { EventsService } from './services/events.service'
import { CreateEventDto } from './dto/create-event.dto'
import { AuthGuard } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { EventFilters, SearchOptions } from './types/event.types'

@Controller('events')
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@Post()
	@AuthGuard()
	@UseInterceptors(FilesInterceptor('images', 10))
	async create(
		@CurrentUser('id') userId: string,
		@Body() dto: CreateEventDto,
		@UploadedFiles(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
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
		@Query('priceMin', ParseFloatPipe) priceMin?: number,
		@Query('priceMax', ParseFloatPipe) priceMax?: number,
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
	@AuthGuard()
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
		const event = await this.eventsService.findOne(eventId)
		if (event.organizer.id !== userId) {
			throw new ForbiddenException('Only event organizer can update images')
		}

		return this.eventsService.updateEventImages(eventId, files, imagesToDelete)
	}

	@Delete(':id/images')
	@AuthGuard()
	async deleteImages(
		@Param('id') eventId: string,
		@CurrentUser('id') userId: string,
		@Body('imageUrls') imageUrls: string[]
	) {
		// Check if user is event organizer
		const event = await this.eventsService.findOne(eventId)
		if (event.organizer.id !== userId) {
			throw new ForbiddenException('Only event organizer can delete images')
		}

		return this.eventsService.updateEventImages(eventId, [], imageUrls)
	}
}
