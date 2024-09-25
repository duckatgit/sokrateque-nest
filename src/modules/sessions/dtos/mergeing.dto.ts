import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class Merging {
  @ApiProperty({
    description: 'the id to which to merge',
    example: '0',
  })
  @IsNotEmpty()
  primaryId: string;

  @ApiProperty({
    description: 'the session to be merged with the primary session',
    example: '0',
  })
  @IsNotEmpty()
  secondaryId: string;
}
