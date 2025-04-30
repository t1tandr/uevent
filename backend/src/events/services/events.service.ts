import {
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { S3Service } from '../../s3/s3.service'
// import { NotificationService } from '../../notification/notification.service'
import { CreateEventDto } from '../dto/create-event.dto'
import {
	EventFilters,
	EventDetails,
	EventModel,
	SearchOptions
} from '../types/event.types'
import { PrismaService } from 'src/prisma.service'
import { EventPublisherService } from '../queues/event-publisher.service'
import { NotificationsService } from 'src/notifications/notifications.service'
import { CompanyRole, EventStatus } from '@prisma/client'
import { MailService } from 'src/mail/mail.service'
import { UpdateEventDto } from '../dto/update-event.dto'

@Injectable()
export class EventsService {
	constructor(
		private prisma: PrismaService,
		private s3Service: S3Service,
		private eventPublisherService: EventPublisherService,
		private notificationsService: NotificationsService,
		private mailService: MailService
	) {}

	async getMyEvents(userId: string) {
		const events = await this.prisma.event.findMany({
			where: {
				OR: [
					{ organizerId: userId },
					{
						attendees: {
							some: { userId }
						}
					}
				]
			},
			include: {
				organizer: true,
				Category: true,
				Company: true
			},
			orderBy: {
				date: 'asc'
			}
		})

		return events || []
	}

	async checkEventAccess(
		eventId: string,
		userId: string,
		allowedRoles: CompanyRole[]
	) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: {
				Company: {
					include: {
						members: {
							where: { userId }
						}
					}
				}
			}
		})

		if (!event) {
			throw new NotFoundException('Event not found')
		}

		const member = event.Company.members[0]
		if (!member || !allowedRoles.includes(member.role)) {
			throw new ForbiddenException('Insufficient permissions')
		}

		return event
	}

	async uploadEventImages(files: Express.Multer.File[]): Promise<string[]> {
		return this.s3Service.uploadMultipleFiles(files, 'events')
	}

	async deleteEventImage(imageUrl: string): Promise<void> {
		await this.s3Service.deleteFile(imageUrl)
	}

	async create(
		userId: string,
		dto: CreateEventDto,
		files?: Express.Multer.File[]
	) {
		let imagesUrls: string[] = []

		if (files && files.length > 0) {
			imagesUrls = await this.uploadEventImages(files)
		}

		return this.prisma.$transaction(async tx => {
			const event = await tx.event.create({
				data: {
					...dto,
					imagesUrls,
					organizerId: userId,
					promoCodes: dto.promoCodes
						? {
								create: dto.promoCodes
							}
						: undefined
				},
				include: {
					organizer: true,
					Category: true,
					Company: true
				}
			})

			if (dto.publishDate) {
				await this.eventPublisherService.schedulePublish(
					event.id,
					new Date(dto.publishDate)
				)
			}

			return event
		})
	}

	async updateEvent(eventId: string, userId: string, dto: UpdateEventDto) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: {
				attendees: {
					include: {
						user: true
					}
				}
			}
		})

		if (!event) {
			throw new NotFoundException('Event not found')
		}

		// If status is being changed to CANCELLED, handle cancellation
		if (
			dto.status === EventStatus.CANCELLED &&
			event.status !== EventStatus.CANCELLED
		) {
			return this.cancelEvent(eventId)
		}

		const updatedEvent = await this.prisma.event.update({
			where: { id: eventId },
			data: {
				...dto,
				// Convert date string to Date object if provided
				date: dto.date ? new Date(dto.date) : undefined,
				publishDate: dto.publishDate ? new Date(dto.publishDate) : undefined
			},
			include: {
				organizer: true,
				Category: true,
				Company: true,
				attendees: {
					include: {
						user: true
					}
				}
			}
		})

		// If significant changes were made and notifications are enabled
		if (
			event.notifyOrganizer &&
			(dto.date || dto.location || dto.status === EventStatus.PUBLISHED)
		) {
			await this.notificationsService.createOrganizerUpdateNotification(
				eventId,
				`Event "${updatedEvent.title}" has been updated: ${this.getUpdateMessage(dto)}`
			)
		}

		return updatedEvent
	}

	private getUpdateMessage(dto: UpdateEventDto): string {
		const changes = []
		if (dto.date) changes.push('date changed')
		if (dto.location) changes.push('location updated')
		if (dto.status === EventStatus.PUBLISHED) changes.push('event published')
		return changes.join(', ')
	}

	async updateEventImages(
		eventId: string,
		newFiles: Express.Multer.File[],
		imagesToDelete?: string[]
	) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			select: { imagesUrls: true }
		})

		if (!event) {
			throw new NotFoundException('Event not found')
		}

		if (imagesToDelete?.length) {
			await Promise.all(
				imagesToDelete.map(imageUrl => this.deleteEventImage(imageUrl))
			)
		}

		const newImageUrls = await this.uploadEventImages(newFiles)

		const updatedImageUrls = [
			...event.imagesUrls.filter(url => !imagesToDelete?.includes(url)),
			...newImageUrls
		]

		return this.prisma.event.update({
			where: { id: eventId },
			data: { imagesUrls: updatedImageUrls }
		})
	}

	async findAll(filters: EventFilters) {
		const where = this.buildFiltersQuery(filters)

		return this.prisma.event.findMany({
			where,
			include: {
				organizer: {
					select: {
						id: true,
						name: true,
						avatarUrl: true
					}
				},
				Category: true,
				Company: true
			},
			orderBy: {
				date: 'asc'
			}
		})
	}

	async findOne(id: string): Promise<EventDetails> {
		const event = await this.prisma.event.findUnique({
			where: { id },
			include: {
				organizer: {
					select: {
						id: true,
						name: true,
						avatarUrl: true
					}
				},
				attendees: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								avatarUrl: true
							}
						}
					}
				},
				comments: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								avatarUrl: true
							}
						}
					}
				},
				Category: true,
				Company: true
			}
		})

		if (!event) {
			throw new NotFoundException('Event not found')
		}

		// Transform attendees to match EventDetails type
		const transformedEvent = {
			...event,
			attendees: event.attendees.map(ticket => ({
				id: ticket.user.id,
				name: ticket.user.name,
				avatarUrl: ticket.user.avatarUrl
			}))
		}

		const similarEvents = await this.findSimilarEvents(transformedEvent)

		return {
			...transformedEvent,
			similarEvents
		}
	}

	private async findSimilarEvents(
		event: Omit<EventDetails, 'similarEvents'>
	): Promise<EventModel[]> {
		const similarEvents = await this.prisma.event.findMany({
			where: {
				AND: [
					{
						OR: [
							{ categoryId: event.categoryId },
							{ theme: event.theme },
							{ format: event.format }
						]
					},
					{
						id: { not: event.id },
						date: { gte: new Date() },
						status: 'PUBLISHED'
					}
				]
			},
			orderBy: [
				{
					date: 'asc'
				}
			],
			take: 5
		})

		return (
			similarEvents
				.map(event => ({
					...event,
					score: this.calculateSimilarityScore(event, event)
				}))
				.sort((a, b) => b.score - a.score)
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				.map(({ score, ...event }) => event)
		)
	}

	private calculateSimilarityScore(
		event1: EventModel,
		event2: EventModel
	): number {
		let score = 0
		if (event1.categoryId === event2.categoryId) score += 3
		if (event1.theme === event2.theme) score += 2
		if (event1.format === event2.format) score += 1
		return score
	}

	async searchEvents(filters: EventFilters, options: SearchOptions = {}) {
		const { page = 1, limit = 10, sortBy = 'date', sortOrder = 'asc' } = options

		const where = this.buildFiltersQuery(filters)
		const skip = (page - 1) * limit

		const [events, total] = await Promise.all([
			this.prisma.event.findMany({
				where,
				include: {
					organizer: {
						select: {
							id: true,
							name: true,
							avatarUrl: true
						}
					},
					Category: true,
					Company: true,
					_count: {
						select: {
							attendees: true
						}
					}
				},
				orderBy: this.buildSortQuery(sortBy, sortOrder),
				skip,
				take: limit
			}),
			this.prisma.event.count({ where })
		])

		return {
			data: events,
			meta: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
				hasNextPage: skip + events.length < total,
				hasPreviousPage: page > 1
			}
		}
	}

	private buildFiltersQuery(filters: EventFilters) {
		const where: any = {
			status: 'PUBLISHED'
		}

		if (filters.search) {
			where.OR = [
				{ title: { contains: filters.search, mode: 'insensitive' } },
				{ description: { contains: filters.search, mode: 'insensitive' } },
				{ location: { contains: filters.search, mode: 'insensitive' } }
			]
		}

		// Фильтр по датам
		if (filters.date) {
			where.date = {
				gte: new Date(filters.date),
				lt: new Date(
					new Date(filters.date).setDate(new Date(filters.date).getDate() + 1)
				)
			}
		} else {
			where.date = {
				gte: new Date()
			}
		}

		if (filters.format) {
			where.format = filters.format
		}

		if (filters.theme) {
			where.theme = filters.theme
		}

		if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
			where.price = {}
			if (filters.priceMin !== undefined) {
				where.price.gte = filters.priceMin
			}
			if (filters.priceMax !== undefined) {
				where.price.lte = filters.priceMax
			}
		}

		if (filters.category) {
			where.categoryId = filters.category
		}

		if (filters.location) {
			where.location = { contains: filters.location, mode: 'insensitive' }
		}

		return where
	}

	private buildSortQuery(sortBy: string, sortOrder: 'asc' | 'desc') {
		const sortQuery: any = {}

		switch (sortBy) {
			case 'date':
				sortQuery.date = sortOrder
				break
			case 'price':
				sortQuery.price = sortOrder
				break
			case 'popularity':
				sortQuery.attendees = {
					_count: sortOrder
				}
				break
			default:
				sortQuery.date = 'asc'
		}

		return sortQuery
	}

	async cancelEvent(eventId: string) {
		const event = await this.prisma.event.update({
			where: { id: eventId },
			data: { status: EventStatus.CANCELLED },
			include: {
				attendees: {
					include: {
						user: true
					}
				}
			}
		})

		await this.notificationsService.createOrganizerUpdateNotification(
			eventId,
			`Event "${event.title}" has been cancelled`
		)

		// Send cancellation emails
		await Promise.all(
			event.attendees.map(attendee =>
				this.mailService.sendEventCancellation(attendee.user, event)
			)
		)

		return event
	}
}
