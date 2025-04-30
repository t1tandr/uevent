import { IsString, IsUUID, IsOptional } from 'class-validator'

export class CreateCommentDto {
	@IsString()
	content: string

	@IsUUID()
	eventId: string

	@IsUUID()
	@IsOptional()
	parentId?: string
}
