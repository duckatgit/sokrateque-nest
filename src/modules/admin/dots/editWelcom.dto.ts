import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class EditWelcome {
  @ApiProperty({
    description: 'title of the welcome card',
    example: '',
  })
  @IsNotEmpty()
  title?: string;

  @ApiProperty({
    description: 'description of the welcome card',
    example: '',
  })
  @IsNotEmpty()
  description?: string;

  @ApiProperty({
    description: 'description of the welcome card',
    example: '',
  })
  @IsNotEmpty()
  order?: number;

  @ApiProperty({
    description: 'description of the welcome card',
    example: '',
  })
  @IsNotEmpty()
  imageUrl?: string;
}
