import multer from "multer";
import sharp from "sharp";
import { APIError } from "../utils/errorHandler.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(
      new APIError(
        "Invalid file type. Only JPG, PNG and WebP are allowed",
        400
      ),
      false
    );
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Increased to 10MB to allow for compression
    files: 1,
  },
});

// Image compression function
async function compressImage(buffer, mimetype) {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  // If image is already small enough, return original buffer
  if (buffer.length <= 5 * 1024 * 1024) {
    return buffer;
  }

  let quality = 80; // Start with 80% quality
  let compressedBuffer;

  // Compress based on image type
  switch (mimetype) {
    case "image/jpeg":
      compressedBuffer = await image
        .jpeg({ quality, progressive: true })
        .toBuffer();
      break;
    case "image/png":
      compressedBuffer = await image
        .png({ quality, progressive: true })
        .toBuffer();
      break;
    case "image/webp":
      compressedBuffer = await image.webp({ quality }).toBuffer();
      break;
    default:
      return buffer;
  }

  // If still too large, reduce quality further
  if (compressedBuffer.length > 5 * 1024 * 1024) {
    quality = 60;
    return await compressImage(compressedBuffer, mimetype);
  }

  return compressedBuffer;
}

// Middleware wrapper to handle multer errors
export const uploadPhoto = (req, res, next) => {
  const uploadMiddleware = upload.single("photo");

  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          new APIError(
            "File size too large. Maximum size is 10MB before compression",
            400
          )
        );
      }
      return next(new APIError(err.message, 400));
    } else if (err) {
      return next(err);
    }

    // If file exists, try to compress it
    if (req.file) {
      try {
        const compressedBuffer = await compressImage(
          req.file.buffer,
          req.file.mimetype
        );
        req.file.buffer = compressedBuffer;
        req.file.size = compressedBuffer.length;

        // If still too large after compression
        if (compressedBuffer.length > 5 * 1024 * 1024) {
          return next(
            new APIError(
              "File still too large after compression. Please try with a smaller image.",
              400
            )
          );
        }
      } catch (error) {
        return next(
          new APIError("Error processing image. Please try again.", 500)
        );
      }
    }

    next();
  });
};
