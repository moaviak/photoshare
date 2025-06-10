import jwt from "jsonwebtoken";
import { APIError } from "../utils/errorHandler.js";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new APIError("Authentication required", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      next(new APIError("Invalid token", 401));
    } else if (error.name === "TokenExpiredError") {
      next(new APIError("Token expired", 401));
    } else {
      next(error);
    }
  }
};

export const creatorOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new APIError("Authentication required", 401);
    }

    const user = await User.findById(req.user._id);

    if (user.role !== "creator") {
      throw new APIError("Creator access required", 403);
    }

    // Ensure user is in creator view
    if (user.currentView !== "creator") {
      throw new APIError("Must be in creator view", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};
