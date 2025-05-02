import { Controller, Get, Post, Delete, Param } from '@nestjs/common'
import { AuthGuard } from 'src/auth/decorators/auth.decorator'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { SubscribersService } from './subscribers.service'

@Controller('subscribers')
export class SubscribersController {
	constructor(private readonly subscribersService: SubscribersService) {}

	@Post(':companyId')
	@AuthGuard()
	async subscribeToCompany(
		@CurrentUser('id') userId: string,
		@Param('companyId') companyId: string
	) {
		return this.subscribersService.subscribeToCompany(userId, companyId)
	}

	@Delete(':companyId')
	@AuthGuard()
	async unsubscribeFromCompany(
		@CurrentUser('id') userId: string,
		@Param('companyId') companyId: string
	) {
		return this.subscribersService.unsubscribeFromCompany(userId, companyId)
	}

	@Get(':companyId/check')
	@AuthGuard()
	async checkSubscription(
		@CurrentUser('id') userId: string,
		@Param('companyId') companyId: string
	) {
		return this.subscribersService.isSubscribed(userId, companyId)
	}

	@Get('company/:companyId')
	async getCompanySubscribers(@Param('companyId') companyId: string) {
		return this.subscribersService.getCompanySubscribers(companyId)
	}

	@Get('user')
	@AuthGuard()
	async getUserSubscriptions(@CurrentUser('id') userId: string) {
		return this.subscribersService.getUserSubscriptions(userId)
	}

	@Get('company/:companyId/count')
	async getSubscribersCount(@Param('companyId') companyId: string) {
		return this.subscribersService.getSubscribersCount(companyId)
	}
}
