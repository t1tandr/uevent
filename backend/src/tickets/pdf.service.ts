import { Injectable } from '@nestjs/common'
import { Ticket, Event, User } from '@prisma/client'
import * as PDFDocument from 'pdfkit'

@Injectable()
export class PDFService {
	async generateTicket(
		ticket: Ticket & { event: Event & { organizer?: User }; user: User }
	): Promise<Buffer> {
		return new Promise(resolve => {
			const doc = new PDFDocument({
				size: 'A4',
				margin: 50,
				layout: 'portrait'
			})
			const chunks: Buffer[] = []

			doc.on('data', chunk => chunks.push(chunk))
			doc.on('end', () => resolve(Buffer.concat(chunks)))

			this.addTicketStyle(doc, ticket)

			doc.end()
		})
	}

	private addTicketStyle(
		doc: PDFKit.PDFDocument,
		ticket: Ticket & { event: Event; user: User }
	) {
		doc
			.rect(50, 50, doc.page.width - 100, doc.page.height - 140)
			.fillAndStroke('#ffffff', '#4f46e5')

		doc
			.fontSize(28)
			.font('Helvetica-Bold')
			.fillColor('#4f46e5')
			.text('UEvent Ticket', { align: 'center' })
			.moveDown()

		doc
			.fontSize(12)
			.fillColor('#aaaaaa')
			.text('UEvent', doc.page.width - 100, 70, { align: 'right' })

		doc
			.rect(70, 130, doc.page.width - 140, 80)
			.fillAndStroke('#4f46e5', '#4f46e5')

		doc
			.fontSize(22)
			.fillColor('#ffffff')
			.text(ticket.event.title, 90, 155, {
				align: 'center',
				width: doc.page.width - 180
			})

		const startY = 250
		const lineHeight = 30
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const colWidth = (doc.page.width - 140) / 2

		const eventDate = new Date(ticket.event.date).toLocaleString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})

		doc.fontSize(12).fillColor('#666666')
		doc.text('Date & Time:', 90, startY)
		doc.text('Location:', 90, startY + lineHeight)
		doc.text('Ticket Holder:', 90, startY + lineHeight * 2)
		doc.text('Ticket ID:', 90, startY + lineHeight * 3)
		doc.text('Price:', 90, startY + lineHeight * 4)

		doc.fontSize(12).fillColor('#000000').font('Helvetica-Bold')
		doc.text(eventDate, 180, startY)
		doc.text(ticket.event.location || 'TBA', 180, startY + lineHeight)
		doc.text(ticket.user.name, 180, startY + lineHeight * 2)
		doc.text(ticket.id, 180, startY + lineHeight * 3)
		doc.text(`$${ticket.price.toFixed(2)}`, 180, startY + lineHeight * 4)

		doc
			.moveTo(70, startY + lineHeight * 5 - 10)
			.lineTo(doc.page.width - 70, startY + lineHeight * 5 - 10)
			.stroke('#cccccc')

		if (ticket.qrCode) {
			doc
				.fontSize(14)
				.fillColor('#333333')
				.font('Helvetica')
				.text('Please present this QR code at the event entrance:', {
					align: 'center'
				})
				.moveDown()

			doc.image(ticket.qrCode, {
				fit: [150, 150],
				align: 'center'
			})
		}

		doc
			.fontSize(8)
			.fillColor('#999999')
			.text(
				`This ticket was generated ${new Date().toLocaleString()} · UEvent ticketing system · Ticket verification at venue entry`,
				50,
				doc.page.height - 70,
				{ align: 'center' }
			)
	}
}
