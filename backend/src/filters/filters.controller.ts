import { Controller, Get } from '@nestjs/common'
import { EVENT_FORMATS } from './constants/event-formats.constants'
import { EVENT_THEMES } from './constants/event-themes.constants'

@Controller('filters')
export class FiltersController {
	@Get()
	getAllFilters() {
		return {
			formats: EVENT_FORMATS,
			themes: EVENT_THEMES
		}
	}

	@Get('formats')
	getEventFormats() {
		return EVENT_FORMATS
	}

	@Get('themes')
	getEventThemes() {
		return EVENT_THEMES
	}
}
