import userService from "../services/userService.js";
import { generateToken, invalidateToken } from "../utils/jwt.js";
import { APIError } from "../utils/errorHandler.js";

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const { user, session } = await userService.register(email, password, name);

    // Set secure cookie with JWT
    res.cookie("jwt", session.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        session,
      },
    });
  } catch (error) {
    next(error instanceof APIError ? error : new APIError(error.message, 400));
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, session } = await userService.login(email, password);

    // Set secure cookie with JWT
    res.cookie("jwt", session.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        user,
        session,
      },
    });
  } catch (error) {
    next(error instanceof APIError ? error : new APIError(error.message, 401));
  }
};

export const logout = async (req, res, next) => {
  try {
    // Get token from request
    const token = req.token;

    // Invalidate the token
    if (token) {
      invalidateToken(token);
    }

    // Clear the cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      data: "Logged out successfully",
    });
  } catch (error) {
    next(error instanceof APIError ? error : new APIError(error.message, 500));
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached to req by auth middleware
    const user = await userService.getCurrentUser(req.user._id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error instanceof APIError ? error : new APIError(error.message, 404));
  }
};

export const upgradeToCreator = async (req, res, next) => {
  try {
    const user = await userService.upgradeToCreator(req.user._id);

    // Generate new token with updated role
    const token = generateToken(user);

    // Update cookie with new token
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error instanceof APIError ? error : new APIError(error.message, 400));
  }
};

export const toggleView = async (req, res, next) => {
  try {
    const user = await userService.toggleUserView(req.user._id);

    // Generate new token with updated view
    const token = generateToken(user);

    // Update cookie with new token
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error instanceof APIError ? error : new APIError(error.message, 400));
  }
};
