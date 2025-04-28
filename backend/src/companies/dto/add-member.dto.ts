import { IsEmail, IsEnum } from 'class-validator'
import { CompanyRole } from '@prisma/client'

export class AddMemberDto {
	@IsEmail()
	email: string

	@IsEnum(CompanyRole)
	role: CompanyRole
}
