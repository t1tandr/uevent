import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { User, Event, Ticket, Company, CompanyRole } from '@prisma/client'

@Injectable()
export class MailService {
	constructor(private mailerService: MailerService) {}

	private async sendEmail(options: {
		to: string
		subject: string
		template: string
		context: any
	}) {
		return this.mailerService.sendMail({
			...options,
			template: `templates/${options.template}`,
			context: {
				...options.context,
				frontendUrl: process.env.FRONTEND_URL,
				year: new Date().getFullYear()
			}
		})
	}

	async sendEmailWithPDFTicket(
		user: User,
		event: Event,
		ticket: Ticket,
		pdfBuffer: Buffer
	) {
		await this.mailerService.sendMail({
			to: user.email,
			subject: `Your ticket for ${event.title}`,
			template: 'ticket-confirmation',
			context: {
				name: user.name,
				eventTitle: event.title,
				eventDate: event.date,
				eventLocation: event.location,
				ticketId: ticket.id,
				qrCode: ticket.qrCode,
				price: ticket.price,
				ticketUrl: `${process.env.FRONTEND_URL}/tickets/${ticket.id}`,
				frontendUrl: process.env.FRONTEND_URL
			},
			attachments: [
				{
					filename: `ticket-${ticket.id}.pdf`,
					content: pdfBuffer,
					contentType: 'application/pdf'
				}
			]
		})
	}

	async sendTicketConfirmation(
		user: User,
		event: Event,
		ticket: Ticket,
		pdfBuffer?: Buffer
	) {
		const attachments = []

		if (pdfBuffer) {
			attachments.push({
				filename: `ticket-${ticket.id}.pdf`,
				content: pdfBuffer,
				contentType: 'application/pdf'
			})
		}

		await this.mailerService.sendMail({
			to: user.email,
			subject: `Your Ticket: ${event.title}`,
			template: 'ticket-confirmation',
			context: {
				name: user.name,
				eventTitle: event.title,
				eventDate: this.formatDate(event.date),
				eventLocation: event.location,
				ticketId: ticket.id,
				qrCode: ticket.qrCode,
				price: ticket.price,
				hasPDF: !!pdfBuffer,
				frontendUrl: this.getFrontendUrl(),
				ticketUrl: `${this.getFrontendUrl()}/profile`
			},
			attachments
		})
	}

	async sendNewAttendeeNotification(
		organizer: User,
		event: Event,
		attendee: User
	) {
		await this.mailerService.sendMail({
			to: organizer.email,
			subject: `New Attendee for ${event.title}`,
			template: 'new-attendee',
			context: {
				organizerName: organizer.name,
				eventTitle: event.title,
				attendeeName: attendee.name,
				attendeeEmail: attendee.email,
				eventDate: this.formatDate(event.date),
				eventUrl: `${this.getFrontendUrl()}/event/${event.id}`,
				frontendUrl: this.getFrontendUrl()
			}
		})
	}

	private formatDate(dateString: Date): string {
		const date = new Date(dateString)
		return date.toLocaleString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	private getFrontendUrl(): string {
		return process.env.FRONTEND_URL || 'http://localhost:3000'
	}

	async sendWelcome(user: User) {
		await this.sendEmail({
			to: user.email,
			subject: 'Welcome to UEvent!',
			template: 'welcome',
			context: {
				name: user.name
			}
		})
	}

	async sendPasswordReset(user: User, token: string) {
		await this.sendEmail({
			to: user.email,
			subject: 'Reset your password',
			template: 'password-reset',
			context: {
				name: user.name,
				resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`
			}
		})
	}

	async sendEventReminder(user: User, event: Event) {
		await this.sendEmail({
			to: user.email,
			subject: `Reminder: ${event.title} is tomorrow!`,
			template: 'event-reminder',
			context: {
				name: user.name,
				eventTitle: event.title,
				eventDate: event.date,
				eventLocation: event.location,
				ticketUrl: `${process.env.FRONTEND_URL}/events/${event.id}`
			}
		})
	}

	async sendCompanyInvitation(user: User, company: Company, role: CompanyRole) {
		await this.sendEmail({
			to: user.email,
			subject: `Invitation to join ${company.name}`,
			template: 'company-invitation',
			context: {
				name: user.name,
				companyName: company.name,
				role,
				acceptUrl: `${process.env.FRONTEND_URL}/companies/${company.id}/accept-invitation`
			}
		})
	}

	async sendCompanyRoleUpdate(
		user: User,
		company: Company,
		newRole: CompanyRole
	) {
		await this.sendEmail({
			to: user.email,
			subject: `Role update in ${company.name}`,
			template: 'company-role-update',
			context: {
				name: user.name,
				companyName: company.name,
				role: newRole,
				companyUrl: `${process.env.FRONTEND_URL}/companies/${company.id}`
			}
		})
	}

	async sendEventCancellation(user: User, event: Event) {
		await this.sendEmail({
			to: user.email,
			subject: `Event Cancelled: ${event.title}`,
			template: 'event-cancellation',
			context: {
				name: user.name,
				eventTitle: event.title,
				eventDate: event.date,
				eventLocation: event.location,
				refundInfo: 'Your ticket will be automatically refunded.',
				supportEmail: process.env.SUPPORT_EMAIL
			}
		})
	}

	async sendEventUpdate(user: User, event: Event, changes: string[]) {
		await this.sendEmail({
			to: user.email,
			subject: `Event Update: ${event.title}`,
			template: 'event-update',
			context: {
				name: user.name,
				eventTitle: event.title,
				eventDate: event.date,
				eventLocation: event.location,
				changes,
				eventUrl: `${process.env.FRONTEND_URL}/events/${event.id}`
			}
		})
	}

	async sendPaymentConfirmation(user: User, event: Event, amount: number) {
		await this.sendEmail({
			to: user.email,
			subject: `Payment Confirmation - ${event.title}`,
			template: 'payment-confirmation',
			context: {
				name: user.name,
				eventTitle: event.title,
				amount,
				date: new Date(),
				eventUrl: `${process.env.FRONTEND_URL}/events/${event.id}`
			}
		})
	}
}
