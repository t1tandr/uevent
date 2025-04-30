import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator'

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsEmail()
	email?: string

	@IsBoolean()
	@IsOptional()
	showInAttendees?: boolean
}
