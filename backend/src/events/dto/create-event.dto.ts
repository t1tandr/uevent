import {
	IsString,
	IsNumber,
	IsOptional,
	IsArray,
	IsBoolean,
	IsDateString,
	ValidateNested
} from 'class-validator'
import { EventFormat, EventTheme } from '@prisma/client'
import { Transform, Type } from 'class-transformer'

class PromoCodeDto {
	@IsString()
	code: string

	@IsNumber()
	@Transform(({ value }) => parseFloat(value))
	discount: number
}

export class CreateEventDto {
	@IsString()
	title: string

	@IsString()
	description: string

	@IsString()
	location: string

	@IsDateString()
	@Transform(({ value }) => new Date(value).toISOString())
	date: string

	@IsNumber()
	@Transform(({ value }) => parseFloat(value))
	price: number

	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => (value ? parseInt(value) : undefined))
	maxAttendees?: number

	@IsString()
	format: EventFormat

	@IsString()
	theme: EventTheme

	@Transform(({ value }) => value === true || value === 'true')
	isAttendeesHidden?: boolean

	@IsString()
	@IsOptional()
	redirectUrl?: string

	@IsDateString()
	@Transform(({ value }) => new Date(value).toISOString())
	publishDate: string

	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	notifyOrganizer: boolean

	@IsString()
	@IsOptional()
	categoryId?: string

	@IsString()
	@IsOptional()
	companyId?: string

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => PromoCodeDto)
	@Transform(({ value }) => {
		if (typeof value === 'string') {
			try {
				return JSON.parse(value)
			} catch {
				return []
			}
		}
		return value
	})
	promoCodes?: PromoCodeDto[]
}
