export class CreatePaymentDto {
	ticketId: string
	amount: number
	paymentMethod: 'CARD' | 'PAYPAL'
	cardDetails?: {
		number: string
		expiry: string
		cvv: string
	}
}
