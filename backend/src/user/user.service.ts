import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'
import { RegisterDto } from 'src/auth/dto/register.dto'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async getById(id: string) {
		return this.prisma.user.findUnique({
			where: {
				id
			}
		})
	}

	async getByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: {
				email
			}
		})
	}

	async create(dto: RegisterDto) {
		const user = {
			email: dto.email,
			password: await hash(dto.password),
			name: dto?.name
		}

		return this.prisma.user.create({
			data: user
		})
	}
}
