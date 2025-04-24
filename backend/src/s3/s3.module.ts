import { Module } from '@nestjs/common'
import { S3Service } from './s3.service'
import { S3Controller } from './s3.controller'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

@Module({
	imports: [
		ConfigModule,
		ThrottlerModule.forRoot({
			throttlers: [
				{
					ttl: 60,
					limit: 10
				}
			]
		})
	],
	controllers: [S3Controller],
	providers: [
		S3Service,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		}
	],
	exports: [S3Service]
})
export class S3Module {}
