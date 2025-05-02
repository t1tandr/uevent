import {
	Event,
	Category,
	Company,
	Comment,
	EventFormat,
	EventTheme,
	EventStatus
} from '@prisma/client'

export interface EventDetails extends Event {
	Company: {
		id: string
		name: string
		logoUrl: string | null
	}
	attendees: {
		id: string
		name: string
		avatarUrl: string | null
	}[]
	comments: (Comment & {
		user: {
			id: string
			name: string
			avatarUrl: string | null
		}
	})[]
	category?: Category
	company?: Company
	similarEvents: Event[]
}

export interface EventModel {
	id: string
	title: string
	description: string
	location: string
	date: Date
	price: number
	maxAttendees: number | null
	imagesUrls: string[]
	status: EventStatus
	format: EventFormat
	theme: EventTheme
	coordinates: string | null
	isAttendeesHidden: boolean
	redirectUrl: string | null
	publishDate: Date
	notifyOrganizer: boolean
	createdAt: Date
	updatedAt: Date
	organizerId: string
	companyId: string | null
	categoryId: string | null
}

export interface EventFilters {
	search?: string
	format?: string
	theme?: string
	date?: Date
	priceMin?: number
	priceMax?: number
	category?: string
	location?: string
}

export interface SearchOptions {
	page?: number
	limit?: number
	sortBy?: 'date' | 'price' | 'popularity'
	sortOrder?: 'asc' | 'desc'
}
