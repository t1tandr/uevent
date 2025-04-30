import { Module } from '@nestjs/common'
import { TicketsService } from './tickets.service'
import { TicketsController } from './tickets.controller'
import { PrismaService } from 'src/prisma.service'
import { PaymentsService } from './payments.service'
import { MailModule } from 'src/mail/mail.module'
import { PDFService } from './pdf.service'

@Module({
	imports: [MailModule],
	controllers: [TicketsController],
	providers: [
		TicketsService,
		PrismaService,
		PaymentsService,
		TicketsService,
		PaymentsService,
		PDFService
	]
})
export class TicketsModule {}
