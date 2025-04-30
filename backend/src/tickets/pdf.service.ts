import { Injectable } from '@nestjs/common'
import { Ticket, Event, User } from '@prisma/client'
import * as PDFDocument from 'pdfkit'

@Injectable()
export class PDFService {
	async generateTicket(
		ticket: Ticket & { event: Event; user: User }
	): Promise<Buffer> {
		return new Promise(resolve => {
			const doc = new PDFDocument()
			const chunks: Buffer[] = []

			doc.on('data', chunk => chunks.push(chunk))
			doc.on('end', () => resolve(Buffer.concat(chunks)))

			// Add ticket content
			doc.fontSize(25).text('Event Ticket', { align: 'center' }).moveDown()

			doc
				.fontSize(15)
				.text(`Event: ${ticket.event.title}`)
				.text(`Date: ${ticket.event.date.toLocaleDateString()}`)
				.text(`Location: ${ticket.event.location}`)
				.text(`Attendee: ${ticket.user.name}`)
				.text(`Ticket ID: ${ticket.id}`)
				.moveDown()

			// Add QR code
			if (ticket.qrCode) {
				doc.image(ticket.qrCode, {
					fit: [250, 250],
					align: 'center'
				})
			}

			doc.end()
		})
	}
}
