import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	MaxFileSizeValidator,
	Param,
	ParseFilePipe,
	Patch,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common'
import { CompaniesService } from './services/company.service'
import { CompanySubscribersService } from './services/company-subscribers.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { CompanyRole } from '@prisma/client'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { CompanyRoles } from './decorators/company-role.decorator'
import { AddMemberDto } from './dto/add-member.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyRoleGuard } from './guards/company-role.guard'
import { AuthGuard } from 'src/auth/decorators/auth.decorator'
import { CompanyMembersService } from './services/company-member.service'

@Controller('companies')
export class CompaniesController {
	constructor(
		private readonly companiesService: CompaniesService,
		private readonly membersService: CompanyMembersService,
		private readonly subscribersService: CompanySubscribersService
	) {}

	@Get()
	findAll() {
		return this.companiesService.findAll()
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.companiesService.findOne(id)
	}

	@Post(':id/members')
	@AuthGuard()
	@UseGuards(CompanyRoleGuard)
	@CompanyRoles(CompanyRole.OWNER)
	addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
		return this.membersService.addMember(id, dto)
	}

	@Patch(':id/members/:memberId')
	@AuthGuard()
	@UseGuards(CompanyRoleGuard)
	@CompanyRoles(CompanyRole.OWNER)
	updateMemberRole(
		@Param('memberId') memberId: string,
		@Body('role') role: CompanyRole
	) {
		return this.membersService.updateMemberRole(memberId, role)
	}

	@Patch(':id')
	@AuthGuard()
	@UseGuards(CompanyRoleGuard)
	@CompanyRoles(CompanyRole.OWNER, CompanyRole.EDITOR)
	update(
		@Param('id') id: string,
		@Body() dto: UpdateCompanyDto,
		@CurrentUser('id') userId: string
	) {
		return this.companiesService.update(id, userId, dto)
	}

	@Post(':id/logo')
	@AuthGuard()
	@UseGuards(CompanyRoleGuard)
	@CompanyRoles(CompanyRole.OWNER, CompanyRole.EDITOR)
	@UseInterceptors(FileInterceptor('file'))
	updateLogo(
		@CurrentUser('id') userId: string,
		@Param('id') id: string,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
					new FileTypeValidator({ fileType: 'image/jpeg|image/png|image/webp' })
				]
			})
		)
		file: Express.Multer.File
	) {
		return this.companiesService.updateLogo(id, userId, file)
	}

	@Post(':id/subscribe')
	@AuthGuard()
	subscribe(@Param('id') id: string, @CurrentUser('id') userId: string) {
		return this.subscribersService.subscribe(id, userId)
	}

	@Delete(':id/subscribe')
	@AuthGuard()
	unsubscribe(@Param('id') id: string, @CurrentUser('id') userId: string) {
		return this.subscribersService.unsubscribe(id, userId)
	}
}
