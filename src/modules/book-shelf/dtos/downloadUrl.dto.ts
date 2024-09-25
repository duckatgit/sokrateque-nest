import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DownloadUrl {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    required: true,
    description: 'Array of files to upload',
    example: [
      'https://www.javatpoint.com/javascript-tutorial',
      'https://react.dev/reference/react/Profiler',
    ],
  })
  @IsNotEmpty()
  url: Array<string>;
}
