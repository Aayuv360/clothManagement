import multer from 'multer';
import sharp from 'sharp';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

export class GridFSUploadService {
  private bucket: GridFSBucket;

  constructor(db: any) {
    this.bucket = new GridFSBucket(db, { bucketName: 'sm_images' });
  }

  // Configure multer for memory storage
  getMulterConfig() {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
    });
  }

  // Upload single image to GridFS
  async uploadSingleImage(file: Express.Multer.File): Promise<string> {
    try {
      // Process image with sharp
      const processedBuffer = await sharp(file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Create readable stream from buffer
      const readableStream = new Readable();
      readableStream.push(processedBuffer);
      readableStream.push(null);

      // Generate filename
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;

      // Upload to GridFS
      const uploadStream = this.bucket.openUploadStream(filename, {
        metadata: {
          originalName: file.originalname,
          contentType: 'image/jpeg',
          uploadedAt: new Date(),
        },
      });

      return new Promise((resolve, reject) => {
        uploadStream.on('error', reject);
        uploadStream.on('finish', () => {
          resolve(uploadStream.id.toString());
        });
        readableStream.pipe(uploadStream);
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Image upload failed: ${errorMessage}`);
    }
  }

  // Upload multiple images to GridFS
  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadSingleImage(file));
    return Promise.all(uploadPromises);
  }

  // Get image by ID
  async getImage(imageId: string): Promise<NodeJS.ReadableStream> {
    try {
      const objectId = new ObjectId(imageId);
      return this.bucket.openDownloadStream(objectId);
    } catch (error) {
      throw new Error(`Image not found: ${imageId}`);
    }
  }

  // Delete image by ID
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const objectId = new ObjectId(imageId);
      await this.bucket.delete(objectId);
      return true;
    } catch (error) {
      console.error(`Failed to delete image ${imageId}:`, error);
      return false;
    }
  }

  // Get image URL for API response
  getImageUrl(imageId: string): string {
    return `/api/images/${imageId}`;
  }
}