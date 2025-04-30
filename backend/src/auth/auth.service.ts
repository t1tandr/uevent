import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from 'src/user/user.service'
import { LoginDto } from './dto/login.dto'
import { verify } from 'argon2'
import { RegisterDto } from './dto/register.dto'
import { Response } from 'express'

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 1
	REFRESH_TOKEN_NAME = 'refreshToken'

	constructor(
		private jwt: JwtService,
		private userService: UserService
	) {}

	async login(dto: LoginDto) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.validateUser(
			dto.email,
			dto.password
		)

		const tokens = await this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	async register(dto: RegisterDto) {
		const oldUser = await this.userService.getByEmail(dto.email)

		if (oldUser) {
			throw new BadRequestException('User already exists')
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.userService.create(dto)

		const tokens = await this.issueTokens(user.id)
		return {
			user,
			...tokens
		}
	}

	private async issueTokens(userId: string) {
		const data = {
			id: userId
		}

		const accessToken = await this.jwt.signAsync(data, {
			expiresIn: '1h'
		})

		const refreshToken = await this.jwt.signAsync(data, {
			expiresIn: '7d'
		})

		return {
			accessToken,
			refreshToken
		}
	}

	private async validateUser(email: string, password: string) {
		const user = await this.userService.getByEmail(email)

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const isValid = await verify(user.password, password)

		if (!isValid) {
			throw new UnauthorizedException('Invalid credentials')
		}

		return user
	}

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken)
		if (!result) {
			throw new UnauthorizedException('Invalid refresh token')
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.userService.getById(result.id)

		const tokens = await this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: 'localhost',
			expires: expiresIn,
			secure: true,
			sameSite: 'none'
		})
	}

	removeRefreshTokenFromResponse(res: Response) {
		res.clearCookie(this.REFRESH_TOKEN_NAME, {
			httpOnly: true,
			domain: 'localhost',
			expires: new Date(0),
			secure: true,
			sameSite: 'none'
		})
	}

	async validateOAuthUser(profile: {
		provider: string
		email?: string
		name?: string
		avatarUrl?: string
	}) {
		let user = await this.userService.getByEmail(profile.email)

		if (!user) {
			user = await this.userService.createOAuthUser({
				email: profile.email,
				name: profile.name,
				avatarUrl: profile.avatarUrl,
				provider: 'GOOGLE'
			})
		}
		const tokens = await this.issueTokens(user.id)
		return {
			user,
			...tokens
		}
	}
}
