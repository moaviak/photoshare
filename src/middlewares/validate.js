import { APIError } from "../utils/errorHandler.js";

export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Parse and validate the request body
      const validated = await schema.parseAsync({
        ...req.body,
        ...(req.query || {}),
        ...(req.params || {}),
      });

      // Replace request properties with validated ones
      req.body = validated;

      next();
    } catch (error) {
      if (error.errors) {
        const messages = error.errors.map((err) => err.message).join(", ");
        next(new APIError(messages, 400));
      } else {
        next(new APIError("Validation failed", 400));
      }
    }
  };
};
