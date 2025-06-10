import { ApiError } from "@/types/models";

export class FileUploadError extends Error {
  constructor(message: string, public filename?: string, public size?: number) {
    super(message);
    this.name = "FileUploadError";
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof FileUploadError) {
    return {
      message: error.message,
      statusCode: 400,
      filename: error.filename,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    message: "An unexpected error occurred",
    statusCode: 500,
  };
};

export const validatePhotoFile = (file: File) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  if (!file) {
    throw new FileUploadError("No file selected");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new FileUploadError(
      "Invalid file type. Only JPG, PNG and WebP images are allowed.",
      file.name
    );
  }

  if (file.size > MAX_SIZE) {
    throw new FileUploadError(
      "File size too large. Maximum size is 5MB.",
      file.name,
      file.size
    );
  }
};

export const formatErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  return apiError.message;
};
