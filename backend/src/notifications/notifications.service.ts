import { Injectable, NotFoundException } from '@nestjs/common'
import { NotificationType } from '@prisma/client'
import { MailService } from '../mail/mail.service'
import { PrismaService } from 'src/prisma.service'
import { CreateNotificationDto } from './dto/create-notifocation.dto'

@Injectable()
export class NotificationsService {
	constructor(
		private prisma: PrismaService,
		private mailService: MailService
	) {}

	async createNotification(dto: {
		userId: string
		type: NotificationType
		title: string
		message: string
		eventId?: string
		companyId?: string
	}) {
		return this.create({
			userId: dto.userId,
			type: dto.type,
			message: dto.message,
			eventId: dto.eventId,
			companyId: dto.companyId
		})
	}

	async createTicketPurchasedNotification(ticketId: string) {
		try {
			const ticket = await this.prisma.ticket.findUnique({
				where: { id: ticketId },
				include: {
					event: true,
					user: true
				}
			})

			if (!ticket) {
				console.error(`Ticket with ID ${ticketId} not found`)
				return
			}

			// Создаем уведомление для покупателя билета
			await this.create({
				message: `Your ticket for "${ticket.event.title}" has been purchased successfully`,
				type: NotificationType.TICKET_PURCHASED,
				userId: ticket.userId,
				eventId: ticket.eventId
			})

			console.log(
				`Ticket purchase notification created for user ${ticket.userId}`
			)
		} catch (error) {
			console.error('Error creating ticket purchase notification:', error)
		}
	}

	async createNewAttendeeNotification(eventId: string, attendeeId: string) {
		try {
			const [event, attendee] = await Promise.all([
				this.prisma.event.findUnique({
					where: { id: eventId },
					include: { organizer: true }
				}),
				this.prisma.user.findUnique({
					where: { id: attendeeId }
				})
			])

			if (!event || !attendee) {
				console.error(
					`Event or attendee not found. EventID: ${eventId}, AttendeeID: ${attendeeId}`
				)
				return
			}

			if (!event.notifyOrganizer) {
				console.log(
					`Skipping notification for event ${eventId} - notifyOrganizer is disabled`
				)
				return
			}

			// Создаем уведомление в системе
			await this.create({
				message: `${attendee.name} has registered for your event "${event.title}"`,
				type: NotificationType.NEW_ATTENDEE,
				userId: event.organizerId,
				eventId
			})

			// Отправляем email уведомление если есть organizerEmail
			await this.mailService.sendNewAttendeeNotification(
				event.organizer,
				event,
				attendee
			)

			console.log(
				`New attendee notification created for organizer ${event.organizerId}`
			)
		} catch (error) {
			console.error('Error creating new attendee notification:', error)
		}
	}

	async getUserNotifications(userId: string) {
		return this.prisma.notification.findMany({
			where: {
				userId,
				isRead: false
			},
			include: {
				event: {
					select: {
						id: true,
						title: true,
						date: true
					}
				},
				company: {
					select: {
						id: true,
						name: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
	}

	async markAsRead(userId: string, notificationId: string) {
		const notification = await this.prisma.notification.findFirst({
			where: {
				id: notificationId,
				userId
			}
		})

		if (!notification) {
			throw new NotFoundException('Notification not found')
		}

		return this.prisma.notification.update({
			where: { id: notificationId },
			data: { isRead: true }
		})
	}

	async markAllAsRead(userId: string) {
		return this.prisma.notification.updateMany({
			where: {
				userId,
				isRead: false
			},
			data: {
				isRead: true
			}
		})
	}

	async create(dto: CreateNotificationDto) {
		return this.prisma.notification.create({
			data: dto,
			include: {
				user: true,
				event: true,
				company: true
			}
		})
	}

	async createEventReminder(eventId: string) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: {
				attendees: {
					include: { user: true }
				}
			}
		})

		const notifications = event.attendees.map(ticket =>
			this.create({
				message: `Reminder: ${event.title} is tomorrow!`,
				type: NotificationType.EVENT_REMINDER,
				userId: ticket.userId,
				eventId
			})
		)

		await Promise.all([
			...notifications,
			...event.attendees.map(ticket =>
				this.mailService.sendEventReminder(ticket.user, event)
			)
		])
	}

	async createOrganizerUpdateNotification(eventId: string, message: string) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: {
				attendees: {
					include: { user: true }
				}
			}
		})

		const notifications = event.attendees.map(ticket =>
			this.create({
				message,
				type: NotificationType.ORGANIZER_UPDATE,
				userId: ticket.userId,
				eventId
			})
		)

		await Promise.all([...notifications])
	}

	async createNewEventNotification(eventId: string) {
		try {
			const event = await this.prisma.event.findUnique({
				where: { id: eventId },
				include: {
					Company: {
						include: {
							subscribers: {
								include: {
									user: true
								}
							}
						}
					}
				}
			})

			if (!event || !event.Company) {
				console.log(
					`Event ${eventId} not found or not associated with a company`
				)
				return
			}

			const { Company: company } = event

			if (!company.subscribers || company.subscribers.length === 0) {
				console.log(`Company ${company.id} has no subscribers`)
				return
			}

			const notifications = company.subscribers.map(subscriber =>
				this.create({
					message: `New event "${event.title}" has been created by ${company.name}`,
					type: NotificationType.COMPANY_UPDATE,
					userId: subscriber.userId,
					eventId: event.id,
					companyId: company.id
				})
			)

			await Promise.all([...notifications])

			console.log(
				`Sent notifications about new event ${event.title} to ${company.subscribers.length} subscribers`
			)
		} catch (error) {
			console.error('Error creating new event notifications:', error)
		}
	}

	async createCompanyUpdateNotification(companyId: string, message: string) {
		const subscribers = await this.prisma.subscriber.findMany({
			where: { companyId },
			include: { user: true }
		})

		const notifications = subscribers.map(sub =>
			this.create({
				message,
				type: NotificationType.COMPANY_UPDATE,
				userId: sub.userId,
				companyId
			})
		)

		await Promise.all([...notifications])
	}
}
