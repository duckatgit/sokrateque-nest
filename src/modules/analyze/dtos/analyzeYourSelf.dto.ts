import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TryYourSelf {
  @ApiProperty({
    description: 'id of the file you want to analyze',
    example: '1477531898095',
  })
  @IsNotEmpty()
  fileId: string;

  @ApiProperty({
    description: 'the promt that you want to use for this file',
    example: 'can you provide a report of this file',
  })
  @IsNotEmpty()
  prompt: string;
}
