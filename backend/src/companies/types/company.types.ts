import { Company, CompanyMember, Event } from '@prisma/client'

export interface CompanyDetails extends Company {
	members: (CompanyMember & {
		user: {
			id: string
			name: string
			email: string
			avatarUrl: string | null
		}
	})[]
	events: Event[]
	_count: {
		subscribers: number
	}
}

export interface CompanyMemberDetails extends CompanyMember {
	user: {
		id: string
		name: string
		email: string
		avatarUrl: string | null
	}
}
