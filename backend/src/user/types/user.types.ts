import { CompanyMember, Event, Ticket } from '@prisma/client'

export interface UserProfile {
	id: string
	email: string
	name: string
	avatarUrl: string

	events: Event[]
	tickets: Ticket[]
	companies: CompanyMember[]
	subscribedCompanies: {
		id: string
		name: string
		logoUrl: string
	}[]
	upcomingEvents: Event[]
	pastEvents: Event[]
}
