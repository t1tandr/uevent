import {
	IsString,
	IsNumber,
	IsOptional,
	IsArray,
	IsBoolean,
	IsDateString
} from 'class-validator'
import { EventFormat, EventTheme } from '@prisma/client'

export class CreateEventDto {
	@IsString()
	title: string

	@IsString()
	description: string

	@IsString()
	location: string

	@IsDateString()
	date: string

	@IsNumber()
	price: number

	@IsOptional()
	@IsNumber()
	maxAttendees?: number

	@IsString()
	format: EventFormat

	@IsString()
	theme: EventTheme

	@IsBoolean()
	isAttendeesHidden: boolean

	@IsString()
	@IsOptional()
	redirectUrl?: string

	@IsDateString()
	publishDate: string

	@IsBoolean()
	notifyOrganizer: boolean

	@IsString()
	@IsOptional()
	categoryId?: string

	@IsString()
	@IsOptional()
	companyId?: string

	@IsArray()
	@IsOptional()
	promoCodes?: { code: string; discount: number }[]
}
