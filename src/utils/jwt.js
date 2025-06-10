import jwt from "jsonwebtoken";
import { APIError } from "./errorHandler.js";

// In-memory token blacklist (consider using Redis in production)
const tokenBlacklist = new Set();

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
      currentView: user.currentView,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
      algorithm: "HS256",
      jwtid: Math.random().toString(36).substr(2), // Unique token ID
    }
  );
};

export const verifyToken = (token) => {
  try {
    if (tokenBlacklist.has(token)) {
      throw new APIError("Token has been invalidated", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // Check token expiration
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp <= currentTimestamp) {
      throw new APIError("Token has expired", 401);
    }

    return decoded;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("Invalid token", 401);
  }
};

export const invalidateToken = (token) => {
  tokenBlacklist.add(token);

  // Optional: Clean up old tokens from blacklist periodically
  // In production, use Redis with TTL instead
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 24 * 60 * 60 * 1000); // 24 hours
};

export const clearBlacklist = () => {
  tokenBlacklist.clear();
};
