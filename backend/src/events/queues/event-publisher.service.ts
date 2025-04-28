import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'

@Injectable()
export class EventPublisherService {
	constructor(
		@InjectQueue('event-publisher') private eventPublisherQueue: Queue
	) {}

	async schedulePublish(eventId: string, publishDate: Date) {
		const delay = publishDate.getTime() - Date.now()

		if (delay <= 0) {
			// Publish immediately
			await this.eventPublisherQueue.add(
				'publish',
				{ eventId },
				{ attempts: 3 }
			)
		} else {
			// Schedule for future
			await this.eventPublisherQueue.add(
				'publish',
				{ eventId },
				{
					delay,
					attempts: 3,
					removeOnComplete: true
				}
			)
		}
	}

	async cancelPublish(eventId: string) {
		const jobs = await this.eventPublisherQueue.getJobs(['delayed'])
		const job = jobs.find(job => job.data.eventId === eventId)

		if (job) {
			await job.remove()
		}
	}
}
