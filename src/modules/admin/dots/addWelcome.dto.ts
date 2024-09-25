import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddWelcome {
  @ApiProperty({
    description: 'title of the welcome card',
    example: 'opening',
  })
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'description of the welcome card',
    example: 'this is the opening card and welcome',
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'description of the welcome card',
    example: 1,
  })
  @IsNotEmpty()
  order: number;

  @ApiProperty({
    description: 'description of the welcome card',
    example: 'https://....',
  })
  @IsNotEmpty()
  imageUrl: string;
}
