import { Injectable } from '@nestjs/common';
import { WelcomeService } from '../welcome/welcome.service';

@Injectable()
export class AdminService {
  constructor(private welcomeService: WelcomeService) {}

  async addWelcome(
    order: number,
    title: string,
    description: string,
    imageUrl: string,
  ) {
    const result = await this.welcomeService.addWelcomeOption(
      order,
      title,
      description,
      imageUrl,
    );
    return result;
  }
  async editWelcomeCard(
    cardId: number,
    title?: string,
    discription?: string,
    imageUrl?: string,
    order?: number,
  ) {
    const result = await this.welcomeService.editWelcome(
      cardId,
      title,
      discription,
      imageUrl,
      order,
    );
    return result;
  }
}
