import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AddWelcome } from './dots/addWelcome.dto';
import { ApiTags } from '@nestjs/swagger';
import { EditWelcome } from './dots/editWelcom.dto';

@ApiTags('Admin Module')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('add-welcome-card')
  async addWelcomeCard(@Body() data: AddWelcome) {
    const result = await this.adminService.addWelcome(
      data.order,
      data.title,
      data.description,
      data.imageUrl,
    );
    return result;
  }
  @Put('edit-welcome-card/:cardId')
  async deleteWelcomeCard(
    @Param('cardId') cardId: number,
    @Body() data: EditWelcome,
  ) {
    const result = await this.adminService.editWelcomeCard(
      cardId,
      data.title,
      data.description,
      data.imageUrl,
      data.order,
    );
    return result;
  }
}
