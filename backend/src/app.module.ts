import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { S3Module } from './s3/s3.module'
import { EventsModule } from './events/events.module'
import { CompaniesModule } from './companies/companies.module'
import { MailModule } from './mail/mail.module'
import { BullModule } from '@nestjs/bull'
import { NotificationsModule } from './notifications/notifications.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env'
		}),
		BullModule.forRoot({
			redis: {
				host: process.env.REDIS_HOST,
				port: parseInt(process.env.REDIS_PORT, 10)
			}
		}),
		AuthModule,
		UserModule,
		S3Module,
		EventsModule,
		CompaniesModule,
		MailModule,
		NotificationsModule
	]
})
export class AppModule {}
