import {
	Controller,
	Get,
	Post,
	Delete,
	Body,
	Param,
	UseGuards
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard'

@Controller('comments')
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	async create(
		@CurrentUser('id') userId: string,
		@Body() dto: CreateCommentDto
	) {
		return this.commentsService.create(userId, dto)
	}

	@Get('event/:eventId')
	async getEventComments(@Param('eventId') eventId: string) {
		return this.commentsService.getEventComments(eventId)
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
		return this.commentsService.delete(id, userId)
	}
}
