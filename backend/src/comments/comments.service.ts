import {
	Injectable,
	NotFoundException,
	ForbiddenException
} from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { CompanyRole } from '@prisma/client'

@Injectable()
export class CommentsService {
	constructor(private prisma: PrismaService) {}

	async create(userId: string, dto: CreateCommentDto) {
		return this.prisma.comment.create({
			data: {
				content: dto.content,
				userId,
				eventId: dto.eventId,
				parentId: dto.parentId
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						avatarUrl: true
					}
				}
			}
		})
	}

	async getEventComments(eventId: string) {
		const comments = await this.prisma.comment.findMany({
			where: {
				eventId,
				parentId: null // Get only root comments
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						avatarUrl: true
					}
				},
				replies: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								avatarUrl: true
							}
						}
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return comments
	}

	async delete(commentId: string, userId: string) {
		const comment = await this.prisma.comment.findUnique({
			where: { id: commentId },
			include: {
				event: {
					include: {
						Company: {
							include: {
								members: {
									where: {
										userId,
										role: {
											in: [CompanyRole.OWNER, CompanyRole.EDITOR]
										}
									}
								}
							}
						}
					}
				}
			}
		})

		if (!comment) {
			throw new NotFoundException('Comment not found')
		}

		const isCompanyMember = comment.event.Company?.members.length > 0
		if (comment.userId !== userId && !isCompanyMember) {
			throw new ForbiddenException('Not authorized to delete this comment')
		}

		await this.prisma.comment.delete({
			where: { id: commentId }
		})

		return { message: 'Comment deleted successfully' }
	}
}
