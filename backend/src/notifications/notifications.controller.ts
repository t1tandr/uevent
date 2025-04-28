import { Controller, Get, Param, Put } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { AuthGuard } from 'src/auth/decorators/auth.decorator'

@Controller('notifications')
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@AuthGuard()
	@Get()
	async getUserNotifications(@CurrentUser('id') userId: string) {
		return this.notificationsService.getUserNotifications(userId)
	}

	@AuthGuard()
	@Put(':id/read')
	async markAsRead(
		@CurrentUser('id') userId: string,
		@Param('id') notificationId: string
	) {
		return this.notificationsService.markAsRead(userId, notificationId)
	}

	@AuthGuard()
	@Put('read-all')
	async markAllAsRead(@CurrentUser('id') userId: string) {
		return this.notificationsService.markAllAsRead(userId)
	}
}
