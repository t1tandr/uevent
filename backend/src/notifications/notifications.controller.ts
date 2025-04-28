import { Controller, Get, Param, Put, UseGuards } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { AuthGuard } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Get()
	async getUserNotifications(@CurrentUser('id') userId: string) {
		return this.notificationsService.getUserNotifications(userId)
	}

	@Put(':id/read')
	async markAsRead(
		@CurrentUser('id') userId: string,
		@Param('id') notificationId: string
	) {
		return this.notificationsService.markAsRead(userId, notificationId)
	}

	@Put('read-all')
	async markAllAsRead(@CurrentUser('id') userId: string) {
		return this.notificationsService.markAllAsRead(userId)
	}
}
