import { ConfigType } from '@nestjs/config'
import { Profile, Strategy } from 'passport-google-oauth20'
import googleOauthConfig from '../config/google-oauth.config'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable } from '@nestjs/common'
import { AuthService } from '../auth.service'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject(googleOauthConfig.KEY)
		private googleConfiguration: ConfigType<typeof googleOauthConfig>,
		private authService: AuthService
	) {
		super({
			clientID: googleConfiguration.clientID,
			clientSecret: googleConfiguration.clientSecret,
			callbackURL: googleConfiguration.callbackURL,
			scope: ['email', 'profile']
		})
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: Profile
	) {
		const { name, emails, photos } = profile

		return this.authService.validateOAuthUser({
			provider: 'GOOGLE',
			email: emails[0].value,
			name: name.givenName,
			avatarUrl: photos[0].value
		})
	}
}
