import { Module } from '@nestjs/common'
import { CompaniesService } from './services/company.service'
import { CompaniesController } from './companies.controller'
import { CompanyMembersService } from './services/company-member.service'
import { CompanySubscribersService } from './services/company-subscribers.service'
import { PrismaService } from 'src/prisma.service'
import { S3Module } from 'src/s3/s3.module'
import { MailModule } from 'src/mail/mail.module'

@Module({
	imports: [S3Module, MailModule],
	controllers: [CompaniesController],
	providers: [
		CompaniesService,
		CompanyMembersService,
		CompanySubscribersService,
		PrismaService
	]
})
export class CompaniesModule {}
