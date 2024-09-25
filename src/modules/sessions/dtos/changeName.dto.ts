import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangeName {
  @ApiProperty({
    description: 'the question that you want to ask chatgpt',
    example: '0',
  })
  @IsNotEmpty()
  newName: string;
}
