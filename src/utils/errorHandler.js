// Custom error class for API errors
export class APIError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "APIError";
  }
}

// File operation specific error
export class FileError extends APIError {
  constructor(message, statusCode = 500, filename = null) {
    super(message, statusCode);
    this.name = "FileError";
    this.filename = filename;
  }
}

// Error response formatter
export const formatErrorResponse = (error) => {
  if (error instanceof FileError) {
    return {
      success: false,
      error: error.message,
      filename: error.filename,
    };
  }

  if (error instanceof APIError) {
    return {
      success: false,
      error: error.message,
      errors: error.errors.length > 0 ? error.errors : undefined,
    };
  }

  // Handle mongoose validation errors
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));

    return {
      success: false,
      error: "Validation Error",
      errors,
    };
  }

  // Handle mongoose cast errors (invalid ObjectId)
  if (error.name === "CastError") {
    return {
      success: false,
      error: "Invalid ID format",
    };
  }

  // Handle duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      success: false,
      error: `${field} already exists`,
    };
  }

  // Default error response
  return {
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message,
  };
};

// Enhanced logger utility
export const logger = {
  info: (message, meta = {}) => {
    if (process.env.NODE_ENV !== "test") {
      console.log(
        JSON.stringify({
          level: "info",
          message,
          ...meta,
          timestamp: new Date().toISOString(),
        })
      );
    }
  },
  error: (message, error = null, meta = {}) => {
    if (process.env.NODE_ENV !== "test") {
      console.error(
        JSON.stringify({
          level: "error",
          message,
          error: error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
                ...(error instanceof FileError
                  ? { filename: error.filename }
                  : {}),
                ...error,
              }
            : null,
          ...meta,
          timestamp: new Date().toISOString(),
        })
      );
    }
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        JSON.stringify({
          level: "debug",
          message,
          ...meta,
          timestamp: new Date().toISOString(),
        })
      );
    }
  },
};
