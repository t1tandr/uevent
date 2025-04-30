import { IsString, IsNumber, Min, Max } from 'class-validator'

export class UpdatePromoCodeDto {
	@IsString()
	code: string

	@IsNumber()
	@Min(0)
	@Max(1)
	discount: number
}
