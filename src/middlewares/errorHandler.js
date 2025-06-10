import { formatErrorResponse, logger } from "../utils/errorHandler.js";

export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error("Request error", err, {
    path: req.path,
    method: req.method,
    query: req.query,
    body: req.body,
    user: req.user?._id,
  });

  // Format and send error response
  const errorResponse = formatErrorResponse(err);
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json(errorResponse);
};
