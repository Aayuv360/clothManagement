import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload only image files.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Upload to Cloudinary
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = 'sareeflow'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'webp',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Upload failed'));
        }
      }
    );

    uploadStream.end(file.buffer);
  });
};

// Fallback local storage for development
export const saveLocalFile = async (file: Express.Multer.File): Promise<string> => {
  const timestamp = Date.now();
  const filename = `${timestamp}-${file.originalname}`;
  const publicPath = `/uploads/${filename}`;
  
  // In a real application, you would save the file to disk here
  // For now, we'll return a placeholder URL
  return publicPath;
};

// Convert file to base64 for database storage
export const convertToBase64 = (file: Express.Multer.File): string => {
  const base64String = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64String}`;
};

export const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  try {
    // Store as base64 in database instead of external storage
    return convertToBase64(file);
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('File upload failed');
  }
};

// Multiple file upload helper
export const uploadMultipleImages = async (files: Express.Multer.File[]): Promise<string[]> => {
  return files.map(file => convertToBase64(file));
};