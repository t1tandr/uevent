import { Injectable } from '@nestjs/common'
import { NotificationType } from '@prisma/client'
import { MailService } from '../mail/mail.service'
import { PrismaService } from 'src/prisma.service'
import { CreateNotificationDto } from './dto/create-notofocation.dto'

@Injectable()
export class NotificationsService {
	constructor(
		private prisma: PrismaService,
		private mailService: MailService
	) {}

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

	async markAsRead(userId: string, notificationId: string) {
		return this.prisma.notification.update({
			where: {
				id: notificationId,
				userId
			},
			data: {
				isRead: true
			}
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

	async getUserNotifications(userId: string) {
		return this.prisma.notification.findMany({
			where: {
				userId
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
						name: true,
						logoUrl: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
	}

	async createEventReminder(eventId: string) {
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

	async createNewAttendeeNotification(eventId: string, attendeeId: string) {
		const [event, attendee] = await Promise.all([
			this.prisma.event.findUnique({
				where: { id: eventId },
				include: {
					organizer: true
				}
			}),
			this.prisma.user.findUnique({
				where: { id: attendeeId }
			})
		])

		if (event.notifyOrganizer) {
			await Promise.all([
				this.create({
					message: `${attendee.name} has registered for ${event.title}`,
					type: NotificationType.NEW_ATTENDEE,
					userId: event.organizerId,
					eventId
				}),
				this.mailService.sendNewAttendeeNotification(
					event.organizer,
					event,
					attendee
				)
			])
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

		await Promise.all(notifications)
	}
}
