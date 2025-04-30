import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class EventCommentsService {
	constructor(private prisma: PrismaService) {}

	async create(eventId: string, userId: string, content: string) {
		const event = await this.prisma.event.findUnique({
			where: { id: eventId }
		})

		if (!event) {
			throw new NotFoundException('Event not found')
		}

		return this.prisma.comment.create({
			data: {
				content,
				eventId,
				userId
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

	async findByEventId(eventId: string) {
		return this.prisma.comment.findMany({
			where: { eventId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						avatarUrl: true
					}
				}
			},
			orderBy: {
				createdAt: 'desc'
			}
		})
	}

	async delete(id: string, userId: string) {
		const comment = await this.prisma.comment.findUnique({
			where: { id }
		})

		if (!comment || comment.userId !== userId) {
			throw new NotFoundException('Comment not found or unauthorized')
		}

		return this.prisma.comment.delete({
			where: { id }
		})
	}
}
