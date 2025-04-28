import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
// import { PrismaService } from '../../prisma/prisma.service'
import { EventStatus } from '@prisma/client'
import { MailService } from '../../mail/mail.service'
import { PrismaService } from 'src/prisma.service'

@Processor('event-publisher')
export class EventPublisherProcessor {
	constructor(
		private prisma: PrismaService,
		private mailService: MailService
	) {}

	@Process('publish')
	async handlePublish(job: Job<{ eventId: string }>) {
		const { eventId } = job.data

		const event = await this.prisma.event.update({
			where: { id: eventId },
			data: { status: EventStatus.PUBLISHED },
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

		// Notify company subscribers about new event
		// for (const subscriber of event.company.subscribers) {
		//   await this.mailService.sendNewEventNotification(
		//     subscriber.user,
		//     event
		//   );
		// }

		return event
	}
}
