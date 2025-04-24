import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from 'src/user/user.module'
import { JwtStrategy } from './strategy/jwt.strategy'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { getJwtConfig } from 'src/config/jwt.config'
import googleOauthConfig from './config/google-oauth.config'
import { GoogleStrategy } from './strategy/google.strategy'

@Module({
	imports: [
		UserModule,
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig
		}),
		ConfigModule.forFeature(googleOauthConfig)
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, GoogleStrategy]
})
export class AuthModule {}
