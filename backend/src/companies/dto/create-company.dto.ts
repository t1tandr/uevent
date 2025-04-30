import { IsEmail, IsOptional, IsString } from 'class-validator'

export class CreateCompanyDto {
	@IsString()
	name: string

	@IsEmail()
	@IsOptional()
	email: string

	@IsString()
	location: string

	@IsString()
	@IsOptional()
	description?: string

	@IsString()
	@IsOptional()
	website?: string

	@IsString()
	@IsOptional()
	phone?: string

	@IsString({ each: true })
	@IsOptional()
	socialMedia?: string[]
}
