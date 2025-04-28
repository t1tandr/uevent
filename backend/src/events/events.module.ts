import { Module } from '@nestjs/common'
import { EventsController } from './events.controller'
import { EventsService } from './services/events.service'
import { PromoCodeService } from './services/promo-code.service'
import { S3Module } from 'src/s3/s3.module'
import { EventAttendeeService } from './services/event-atendee.service'
import { EventCommentsService } from './services/event-comment.service'
import { PrismaService } from 'src/prisma.service'
import { S3Service } from 'src/s3/s3.service'
import { BullModule } from '@nestjs/bull'
import { EventPublisherProcessor } from './queues/event-publisher.processor'
import { EventPublisherService } from './queues/event-publisher.service'
import { MailService } from 'src/mail/mail.service'
import { NotificationsModule } from 'src/notifications/notifications.module'
import { EventAttendeeController } from './events-atendee.controller'

@Module({
	imports: [
		S3Module,
		BullModule.registerQueue({
			name: 'event-publisher'
		}),
		NotificationsModule
	],
	controllers: [EventsController, EventAttendeeController],
	providers: [
		EventsService,
		EventAttendeeService,
		EventCommentsService,
		PromoCodeService,
		PrismaService,
		S3Service,
		EventPublisherProcessor,
		EventPublisherService,
		MailService
	],
	exports: [EventsService]
})
export class EventsModule {}
