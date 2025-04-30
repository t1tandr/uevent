import { Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { join } from 'path'
import { ConfigService } from '@nestjs/config'
import { MailService } from './mail.service'

@Module({
	imports: [
		MailerModule.forRootAsync({
			useFactory: async (config: ConfigService) => ({
				transport: {
					host: config.get('MAIL_HOST'),
					port: config.get('MAIL_PORT'),
					secure: config.get('MAIL_SECURE') === 'true',
					auth: {
						user: config.get('MAIL_USER'),
						pass: config.get('MAIL_PASSWORD')
					}
				},
				defaults: {
					from: `"UEvent" <${config.get('MAIL_FROM')}>`
				},
				template: {
					dir: join(__dirname, 'templates'),
					adapter: new HandlebarsAdapter(undefined, {
						inlineCssEnabled: true
					}),
					options: {
						strict: true
					}
				}
			}),
			inject: [ConfigService]
		})
	],
	providers: [MailService],
	exports: [MailService]
})
export class MailModule {}
