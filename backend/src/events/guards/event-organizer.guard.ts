import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { CompanyRole } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class EventOrganizerGuard implements CanActivate {
	constructor(private prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		const userId = request.user.id
		const eventId = request.params.eventId

		const event = await this.prisma.event.findUnique({
			where: { id: eventId },
			include: {
				Company: {
					include: {
						members: {
							where: {
								userId,
								role: { in: [CompanyRole.OWNER, CompanyRole.EDITOR] }
							}
						}
					}
				}
			}
		})

		return event?.Company?.members.length > 0
	}
}
