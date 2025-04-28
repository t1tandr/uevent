import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { MailModule } from 'src/mail/mail.module'
import { PrismaService } from 'src/prisma.service'

@Module({
	imports: [MailModule],

	controllers: [NotificationsController],
	providers: [NotificationsService, PrismaService],
	exports: [NotificationsService]
})
export class NotificationsModule {}
