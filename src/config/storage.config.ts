import { UnprocessableEntityException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
const allowedFileFormats = ['.pdf', '.txt', '.docx'];

export const fileUploadOptions = {
  storage: diskStorage({
    filename: (req, file, cb) => {
      // Generating a 32 random chars long string
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      // Calling the callback passing the random name generated with the original extension name
      cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Check if the file extension is allowed
    const ext = extname(file.originalname).toLowerCase();
    if (!allowedFileFormats.includes(ext)) {
      return cb(
        new UnprocessableEntityException('the file format is not allowed'),
        false,
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
};

// {
//   storage: diskStorage({
//     filename: (req, file, cb) => {
//       // Generating a 32 random chars long string
//       const randomName = Array(32)
//         .fill(null)
//         .map(() => Math.round(Math.random() * 16).toString(16))
//         .join('');
//       // Calling the callback passing the random name generated with the original extension name
//       cb(null, `${randomName}${extname(file.originalname)}`);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     // Check if the file extension is allowed
//     const ext = extname(file.originalname).toLowerCase();
//     if (!allowedFileFormats.includes(ext)) {
//       return cb(
//         new UnprocessableEntityException('the file format is not allowed'),
//         false,
//       );
//     }
//     cb(null, true);
//   },
//   limits: {
//     fileSize: 100 * 1024,
//   },
// }
