import { Controller, Get } from '@nestjs/common';
import { WelcomeService } from './welcome.service';
import { StanderdisationService } from 'src/core/services/standerdisation/standerdisation.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Welcome Modules')
@Controller('welcome')
export class WelcomeController {
  constructor(
    private welcomeService: WelcomeService,
    private standerdisationService: StanderdisationService,
  ) {}

  @Get('get-welcome')
  async getWelcomeData() {
    const result = await this.welcomeService.retreaveAllActiveWelcome();
    return this.standerdisationService.successDataResponse(
      'successfull',
      result,
    );
  }
}
