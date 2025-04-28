import { BullModule } from '@nestjs/bull'
import { Module } from '@nestjs/common'
import { MailModule } from 'src/mail/mail.module'
import { NotificationsModule } from 'src/notifications/notifications.module'
import { S3Module } from 'src/s3/s3.module'
import { EventsController } from './events.controller'
import { EventsService } from './services/events.service'
import { EventAttendeeService } from './services/event-atendee.service'
import { EventCommentsService } from './services/event-comment.service'
import { PromoCodeService } from './services/promo-code.service'
import { EventPublisherProcessor } from './queues/event-publisher.processor'
import { EventPublisherService } from './queues/event-publisher.service'
import { PrismaService } from 'src/prisma.service'

@Module({
	imports: [
		S3Module,
		MailModule,
		NotificationsModule,
		BullModule.registerQueue({
			name: 'event-publisher'
		})
	],
	controllers: [EventsController],
	providers: [
		EventsService,
		EventAttendeeService,
		EventCommentsService,
		PromoCodeService,
		EventPublisherProcessor,
		EventPublisherService,
		PrismaService
	],
	exports: [
		EventsService,
		EventAttendeeService,
		EventCommentsService,
		PromoCodeService
	]
})
export class EventsModule {}
