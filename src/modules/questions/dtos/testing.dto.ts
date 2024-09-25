import { ApiProperty } from '@nestjs/swagger';

export class Testing {
  @ApiProperty({
    description: 'make sure the value here is valid',
    example: 'can you give me a summary',
  })
  text: string;
}
