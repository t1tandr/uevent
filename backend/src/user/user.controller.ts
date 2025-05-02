import {
	Body,
	Controller,
	FileTypeValidator,
	Get,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	Post,
	Put,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { UserService } from './user.service'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { FileInterceptor } from '@nestjs/platform-express'
import { AuthGuard } from 'src/auth/decorators/auth.decorator'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@AuthGuard()
	async getProfile(@CurrentUser('id') userId: string) {
		return this.userService.getProfile(userId)
	}

	@Get(':id')
	async getPublicProfile(@Param('id') userId: string) {
		return this.userService.getPublicProfile(userId)
	}

	@Put('profile')
	@AuthGuard()
	async updateProfile(
		@CurrentUser('id') userId: string,
		@Body() dto: UpdateUserDto
	) {
		return this.userService.updateProfile(userId, dto)
	}

	@Post('update-avatar')
	@AuthGuard()
	@UseInterceptors(FileInterceptor('file'))
	async updateAvatar(
		@CurrentUser('id') userId: string,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
					new FileTypeValidator({ fileType: 'image/png|image/jpg|image/jpeg' })
				]
			})
		)
		file: Express.Multer.File
	) {
		return this.userService.updateAvatar(userId, file)
	}
}
