import * as handlebars from 'handlebars'

handlebars.registerHelper('formatDate', function (date: Date) {
	return new Date(date).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
})

handlebars.registerHelper('formatPrice', function (price: number) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(price)
})

handlebars.registerHelper('year', function () {
	return new Date().getFullYear()
})

handlebars.registerHelper('frontendUrl', function () {
	return process.env.FRONTEND_URL
})
