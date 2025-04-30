import { PrismaClient } from '@prisma/client'

export const categories = [
	{
		name: 'Technology'
	},
	{
		name: 'Health'
	},
	{
		name: 'Finance'
	},
	{
		name: 'Education'
	},
	{
		name: 'Entertainment'
	},
	{
		name: 'Sports'
	},
	{
		name: 'Travel'
	},
	{
		name: 'Food & Drink'
	},
	{
		name: 'Lifestyle'
	},
	{
		name: 'Fashion'
	},
	{
		name: 'Art & Culture'
	},
	{
		name: 'Science'
	},
	{
		name: 'Business'
	}
]

export async function seedCategories(prisma: PrismaClient) {
	console.log('Seeding categories...')

	for (const category of categories) {
		await prisma.category.upsert({
			where: { name: category.name },
			update: {},
			create: category
		})
	}

	console.log('Categories seeding finished')
}
