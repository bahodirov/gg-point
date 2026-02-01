import multer from 'multer';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync, mkdirSync } from 'node:fs';

// Configuration
const MAX_FILE_SIZE = parseInt(process.env['MAX_FILE_SIZE'] || '5242880', 10); // 5MB default
const UPLOAD_DIR = process.env['UPLOAD_DIR'] || 'public/uploads';
const PRODUCTS_DIR = join(UPLOAD_DIR, 'products');

// Ensure upload directory exists
if (!existsSync(PRODUCTS_DIR)) {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  console.log('Created upload directory:', PRODUCTS_DIR);
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// File filter to validate uploads
const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRODUCTS_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0]; // Use first part of UUID
    const ext = file.originalname.split('.').pop();
    const filename = `product-${timestamp}-${uuid}.${ext}`;
    cb(null, filename);
  },
});

// Create multer instance for single file upload
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

// Create multer instance for multiple file uploads
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Max 10 files at once
  },
});

// Memory storage for processing (used when we want to optimize before saving)
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

export { PRODUCTS_DIR, MAX_FILE_SIZE };
