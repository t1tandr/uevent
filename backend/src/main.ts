import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const config = new DocumentBuilder()
		.setTitle('UEvent API')
		.setDescription(
			'API документация для платформы организации мероприятий UEvent'
		)
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'JWT',
				description: 'Введите JWT токен',
				in: 'header'
			},
			'JWT-auth'
		)
		.addTag('auth', 'Аутентификация и авторизация')
		.addTag('events', 'Управление событиями')
		.addTag('companies', 'Управление компаниями')
		.addTag('tickets', 'Билеты и платежи')
		.addTag('subscribers', 'Подписчики и рассылки')
		.addTag('users', 'Управление пользователями')
		.build()

	app.setGlobalPrefix('api')
	app.use(cookieParser())
	app.enableCors({
		origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'X-Requested-With',
			'Accept'
		],
		exposedHeaders: ['Authorization', 'Set-Cookie'],
		maxAge: 86400
	})
	await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
