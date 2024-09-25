import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FolderList {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    required: true,
    description: 'Array of files to upload',
    example: ['1477535799819', '1477534273351'],
  })
  @IsNotEmpty()
  foldersList: Array<string>;
}
