import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { CompanyRole } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class CompanyRoleGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private prisma: PrismaService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// 1. Get required roles from decorator
		const requiredRoles = this.reflector.get<CompanyRole[]>(
			'roles',
			context.getHandler()
		)
		if (!requiredRoles) return true

		// 2. Get request object
		const request = context.switchToHttp().getRequest()
		if (!request.user) throw new UnauthorizedException()

		// 3. Get parameters from request
		const userId = request.user.id
		const companyId = request.params.id

		// 4. Check user's role in the company
		const member = await this.prisma.companyMember.findUnique({
			where: {
				userId_companyId: {
					userId,
					companyId
				}
			}
		})

		if (!member) return false

		return requiredRoles.includes(member.role)
	}
}
