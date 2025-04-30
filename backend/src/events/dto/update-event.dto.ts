import {
	IsString,
	IsNumber,
	IsOptional,
	IsBoolean,
	IsDateString,
	IsEnum
} from 'class-validator'
import { EventFormat, EventTheme, EventStatus } from '@prisma/client'

export class UpdateEventDto {
	@IsOptional()
	@IsString()
	title?: string

	@IsOptional()
	@IsString()
	description?: string

	@IsOptional()
	@IsString()
	location?: string

	@IsOptional()
	@IsDateString()
	date?: string

	@IsOptional()
	@IsNumber()
	price?: number

	@IsOptional()
	@IsNumber()
	maxAttendees?: number

	@IsOptional()
	@IsEnum(EventFormat)
	format?: EventFormat

	@IsOptional()
	@IsEnum(EventTheme)
	theme?: EventTheme

	@IsOptional()
	@IsBoolean()
	isAttendeesHidden?: boolean

	@IsOptional()
	@IsString()
	redirectUrl?: string

	@IsOptional()
	@IsDateString()
	publishDate?: string

	@IsOptional()
	@IsBoolean()
	notifyOrganizer?: boolean

	@IsOptional()
	@IsString()
	categoryId?: string

	@IsOptional()
	@IsEnum(EventStatus)
	status?: EventStatus
}
