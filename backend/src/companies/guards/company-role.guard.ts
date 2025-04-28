import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
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
		const requiredRoles = this.reflector.get<CompanyRole[]>(
			'roles',
			context.getHandler()
		)

		if (!requiredRoles) {
			return true
		}

		const request = context.switchToHttp().getRequest()
		const userId = request.user.id
		const companyId = request.params.id
		const eventId = request.params.eventId

		// If we have eventId, we need to get the company through the event
		if (eventId) {
			const event = await this.prisma.event.findUnique({
				where: { id: eventId },
				select: { companyId: true }
			})

			if (!event) return false

			const member = await this.prisma.companyMember.findFirst({
				where: {
					userId,
					companyId: event.companyId
				}
			})

			if (!member) return false
			return requiredRoles.includes(member.role)
		}

		// Regular company route check
		if (companyId) {
			const member = await this.prisma.companyMember.findFirst({
				where: {
					userId,
					companyId
				}
			})

			if (!member) return false
			return requiredRoles.includes(member.role)
		}

		return false
	}
}
