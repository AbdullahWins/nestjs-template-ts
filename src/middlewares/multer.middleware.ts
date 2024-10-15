// src/common/middleware/multer.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import * as multer from 'multer';
import * as fs from 'fs';

// Configure multer storage and other settings

const destinationFolder = './uploads'; // Specify the upload directory
const storage = multer.diskStorage({
  //check if destination folder exists, if not create
  destination: (req, file, cb) => {
    if (!fs.existsSync(destinationFolder)) {
      fs.mkdirSync(destinationFolder);
    }
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique filename
  },
});

const upload = multer({ storage });

@Injectable()
export class MulterMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    upload.any()(req, res, (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: 'File upload failed', error: err.message });
      }
      next();
    });
  }
}
