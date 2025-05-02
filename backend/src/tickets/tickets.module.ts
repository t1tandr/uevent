import { Module } from '@nestjs/common'
import { TicketsController } from './tickets.controller'
import { TicketsService } from './tickets.service'
import { PaymentsService } from './payments.service'
import { PDFService } from './pdf.service'
import { MailModule } from '../mail/mail.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from 'src/prisma.service'

@Module({
	imports: [ConfigModule, MailModule, NotificationsModule],
	controllers: [TicketsController],
	providers: [TicketsService, PaymentsService, PDFService, PrismaService],
	exports: [TicketsService, PaymentsService, PDFService]
})
export class TicketsModule {}
