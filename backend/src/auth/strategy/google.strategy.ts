import { Inject, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20'
import googleOauthConfig from '../config/google-oauth.config'
import { ConfigType } from '@nestjs/config'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
	constructor(
		@Inject(googleOauthConfig.KEY)
		private googleConfiguration: ConfigType<typeof googleOauthConfig>
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
		const { id, name, emails, photos } = profilel

		const user = {
			provider: 'GOOGLE',
			email: emails[0].value,
			firstName: name.givenName,
			avatarUrl: photos[0].value
		}

		return user
	}
}
