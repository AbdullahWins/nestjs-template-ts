// src/common/configs/multer.config.ts

import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// Define the storage configuration for Multer
export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Define the directory to store uploaded files
      const uploadPath = './uploads'; // Change this path as needed
      //check if the directory exists, if not create it
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Define the file naming convention
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + extname(file.originalname)); // Append the original file extension
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5 MB
  },
  fileFilter: (req, file, cb) => {
    // Filter for allowed file types (e.g., images)
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValid =
      allowedTypes.test(extname(file.originalname).toLowerCase()) &&
      allowedTypes.test(file.mimetype);
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
};
