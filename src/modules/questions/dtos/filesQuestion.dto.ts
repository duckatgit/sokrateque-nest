import { ApiProperty } from '@nestjs/swagger';

export class FilesQuestion {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    required: true,
    description: 'Array of files to upload',
    example: ['1477535799819', '1477534273351'],
  })
  filesList: Array<string>;

  @ApiProperty({
    description: 'make sure the value here is valid',
    example: 'can you give me a summary',
  })
  question: string;
}
