import { IsEnum, IsOptional, IsString } from 'class-validator'
import { NotificationType } from '@prisma/client'

export class CreateNotificationDto {
	@IsString()
	message: string

	@IsEnum(NotificationType)
	type: NotificationType

	@IsString()
	userId: string

	@IsString()
	@IsOptional()
	eventId?: string

	@IsString()
	@IsOptional()
	companyId?: string
}
