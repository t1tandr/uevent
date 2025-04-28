import { SetMetadata } from '@nestjs/common'
import { CompanyRole } from '@prisma/client'

export const CompanyRoles = (...roles: CompanyRole[]) =>
	SetMetadata('roles', roles)
