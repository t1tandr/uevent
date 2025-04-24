import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class RegisterDto {
	@IsEmail()
	email: string

	@IsString()
	@IsOptional()
	name: string

	@IsString()
	@MinLength(6, {
		message: 'Password is too short. Minimum length is 6 characters.'
	})
	password: string

	@IsOptional()
	@IsString()
	avatarUrl: string
}
