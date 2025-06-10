import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { logger } from "../utils/errorHandler.js";
import { FileError } from "../utils/errorHandler.js";
import Photo from "../models/Photo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const THUMBNAIL_SIZE = 300;
const WEBP_QUALITY = 75;

// Ensure uploads directory exists
await fs.mkdir(UPLOAD_DIR, { recursive: true });

export const fileService = {
  async validatePhotoFile(file) {
    if (!file) {
      throw new FileError("No file uploaded", 400);
    }

    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.mimetype)) {
      throw new FileError(
        "Invalid file type. Only JPG, PNG and WebP are allowed",
        400,
        file.originalname
      );
    }
  },

  async savePhoto(file, filename) {
    try {
      // Ensure upload directory exists
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      logger.debug("Processing image for optimization", { filename });

      // Convert to webp for optimized storage
      const optimizedImage = await sharp(file.buffer)
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()
        .catch((err) => {
          throw new FileError(
            "Failed to optimize image",
            500,
            file.originalname
          );
        });

      // Create thumbnail
      const thumbnail = await sharp(file.buffer)
        .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
          fit: "cover",
          position: "center",
        })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()
        .catch((err) => {
          throw new FileError(
            "Failed to create thumbnail",
            500,
            file.originalname
          );
        });

      // Save files
      const imageFilename = `${filename}.webp`;
      const thumbnailFilename = `${filename}_thumb.webp`;

      await Promise.all([
        fs
          .writeFile(path.join(UPLOAD_DIR, imageFilename), optimizedImage)
          .catch((err) => {
            throw new FileError(
              "Failed to save optimized image",
              500,
              imageFilename
            );
          }),
        fs
          .writeFile(path.join(UPLOAD_DIR, thumbnailFilename), thumbnail)
          .catch((err) => {
            throw new FileError(
              "Failed to save thumbnail",
              500,
              thumbnailFilename
            );
          }),
      ]);

      logger.info("Successfully processed and saved image", {
        filename: imageFilename,
        thumbnailFilename,
      });

      return {
        imageUrl: `/uploads/${imageFilename}`,
        thumbnailUrl: `/uploads/${thumbnailFilename}`,
      };
    } catch (error) {
      if (error instanceof FileError) {
        throw error;
      }
      throw new FileError(
        "Failed to process and save image",
        500,
        file.originalname
      );
    }
  },

  async deletePhoto(filename) {
    try {
      logger.debug("Attempting to delete photo files", { filename });

      const [imageFile, thumbnailFile] = await Promise.all([
        fs.unlink(path.join(UPLOAD_DIR, filename)).catch((err) => {
          logger.error("Error deleting image file", err, { filename });
        }),
        fs
          .unlink(
            path.join(UPLOAD_DIR, filename.replace(".webp", "_thumb.webp"))
          )
          .catch((err) => {
            logger.error("Error deleting thumbnail file", err, { filename });
          }),
      ]);

      logger.info("Successfully deleted photo files", { filename });
    } catch (error) {
      // Log error but don't throw since file might already be deleted
      logger.error("Error during file deletion", error, { filename });
    }
  },

  async cleanupOrphanedFiles() {
    try {
      logger.debug("Starting orphaned files cleanup");

      // Get all files in uploads directory
      const files = await fs.readdir(UPLOAD_DIR);

      // Get list of valid files from database
      const validPhotos = await Photo.find({}, { imageUrl: 1 });
      const validFiles = new Set(
        validPhotos.map((photo) => path.basename(photo.imageUrl))
      );

      let deletedCount = 0;
      // Delete orphaned files
      for (const file of files) {
        // Skip if file is a thumbnail
        if (file.includes("_thumb")) continue;

        // Delete if no corresponding database entry
        if (!validFiles.has(file)) {
          try {
            await Promise.all([
              fs.unlink(path.join(UPLOAD_DIR, file)),
              fs
                .unlink(
                  path.join(UPLOAD_DIR, file.replace(".webp", "_thumb.webp"))
                )
                .catch(() => {}), // Ignore error if thumbnail doesn't exist
            ]);
            deletedCount++;
          } catch (error) {
            logger.error("Error deleting orphaned file", error, {
              filename: file,
            });
          }
        }
      }

      logger.info("Completed orphaned files cleanup", { deletedCount });
    } catch (error) {
      logger.error("Error during cleanup process", error);
    }
  },
};
