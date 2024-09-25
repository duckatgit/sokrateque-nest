import { ForbiddenException, Injectable } from '@nestjs/common';
import { Welcome } from './schema/welcome.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WelcomeService {
  constructor(
    @InjectRepository(Welcome) private welcomeRepository: Repository<Welcome>,
  ) {}

  async addWelcomeOption(
    order: number,
    title: string,
    description: string,
    imageUrl: string,
  ) {
    try {
      const newWelcome = this.welcomeRepository.create({
        order: order,
        title: title,
        discription: description,
        imageUrl: imageUrl,
      });
      return await this.welcomeRepository.save(newWelcome);
    } catch (err) {
      console.error(err);
      throw new ForbiddenException('an error occurred while saving');
    }
  }

  async retreaveAllActiveWelcome() {
    const allWelcome = await this.welcomeRepository.find({
      where: { status: true },
    });
    const result = allWelcome.sort((a, b) => a.order - b.order);
    return result;
  }
  async retreaveAllInactiveWelcome() {
    const allWelcome = await this.welcomeRepository.find({
      where: { status: false },
    });
    return allWelcome;
  }

  async retreaveWelcome(id: number) {
    const welcome = await this.welcomeRepository.findOne({ where: { id: id } });
    return welcome;
  }

  async editWelcome(
    id: number,
    title?: string,
    discription?: string,
    imageUrl?: string,
    order?: number,
  ) {
    const welcome = await this.retreaveWelcome(id);
    welcome.title = title ? title : welcome.title;
    welcome.discription = discription ? discription : welcome.discription;
    welcome.imageUrl = imageUrl ? imageUrl : welcome.imageUrl;
    welcome.order = order ? order : welcome.order;
    return await this.welcomeRepository.save(welcome);
  }
  async changeStatus(id: number, status: boolean) {
    const welcome = await this.retreaveWelcome(id);
    welcome.status = status;
    return await this.welcomeRepository.save(welcome);
  }
}
