import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FileUpload {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: true,
    description: 'Array of files to upload',
  })
  files: Array<Express.Multer.File>;

  @ApiProperty({
    description: 'make sure the value here is valid',
    example: 'myPdf.pdf',
  })
  @IsNotEmpty()
  folderId: number;
}
