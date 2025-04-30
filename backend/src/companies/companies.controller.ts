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
	Query,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { CompaniesService } from './services/company.service'
import { CompanySubscribersService } from './services/company-subscribers.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { CompanyRole, EventStatus } from '@prisma/client'
import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { AddMemberDto } from './dto/add-member.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { AuthGuard } from 'src/auth/decorators/auth.decorator'
import { CompanyMembersService } from './services/company-member.service'
import { CreateCompanyDto } from './dto/create-company.dto'

@Controller('companies')
export class CompaniesController {
	constructor(
		private readonly companiesService: CompaniesService,
		private readonly membersService: CompanyMembersService,
		private readonly subscribersService: CompanySubscribersService
	) {}

	@Get('me')
	@AuthGuard()
	async getMyCompanies(@CurrentUser('id') userId: string) {
		return this.companiesService.getMyCompanies(userId)
	}

	@Get('me/subscribed')
	@AuthGuard()
	async getMySubscribedCompanies(@CurrentUser('id') userId: string) {
		return this.companiesService.getMySubscribedCompanies(userId)
	}

	@Post()
	@AuthGuard()
	@UseInterceptors(FileInterceptor('logo'))
	async create(
		@CurrentUser('id') userId: string,
		@Body() dto: CreateCompanyDto,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
					new FileTypeValidator({ fileType: 'image/jpeg|image/png|image/webp' })
				],
				fileIsRequired: false
			})
		)
		logo?: Express.Multer.File
	) {
		return this.companiesService.create(userId, dto, logo)
	}

	@Get(':id/events')
	async getCompanyEvents(
		@Param('id') companyId: string,
		@Query('status') status?: EventStatus,
		@Query('search') search?: string
	) {
		return this.companiesService.getCompanyEvents(companyId, {
			status,
			search
		})
	}

	@Get(':id/members')
	async getCompanyMembers(
		@Param('id') companyId: string,
		@Query('role') role?: CompanyRole
	) {
		return this.companiesService.getCompanyMembers(companyId, role)
	}

	@Get(':id/subscribers')
	@AuthGuard()
	async getCompanySubscribers(@Param('id') companyId: string) {
		return this.subscribersService.getSubscribers(companyId)
	}

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
	addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
		return this.membersService.addMember(id, dto)
	}

	@Patch(':id/members/:memberId')
	@AuthGuard()
	updateMemberRole(
		@Param('memberId') memberId: string,
		@Body('role') role: CompanyRole
	) {
		return this.membersService.updateMemberRole(memberId, role)
	}

	@Patch(':id')
	@AuthGuard()
	update(
		@Param('id') id: string,
		@Body() dto: UpdateCompanyDto,
		@CurrentUser('id') userId: string
	) {
		return this.companiesService.update(id, userId, dto)
	}

	@Post(':id/logo')
	@AuthGuard()
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
