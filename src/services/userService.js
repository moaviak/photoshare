import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { APIError } from "../utils/errorHandler.js";

class UserService {
  async register(email, password, name) {
    try {
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new APIError("Email already registered", 400);
      }

      // Create user
      const user = await User.create({
        email,
        password,
        name,
        role: "consumer",
        currentView: "consumer",
      });

      // Generate JWT
      const token = generateToken(user);

      return {
        user,
        session: { jwt: token },
      };
    } catch (error) {
      throw new APIError(error.message, 400);
    }
  }

  async login(email, password) {
    try {
      // Find user
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        throw new APIError("Invalid credentials", 401);
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new APIError("Invalid credentials", 401);
      }

      // Generate JWT
      const token = generateToken(user);

      return {
        user,
        session: { jwt: token },
      };
    } catch (error) {
      throw new APIError(error.message, 401);
    }
  }

  async logout() {
    return true; // JWT handled on client side
  }

  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError("User not found", 404);
      }
      return user;
    } catch (error) {
      throw new APIError(error.message, 404);
    }
  }

  async toggleUserView(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError("User not found", 404);
      }

      if (user.role !== "creator") {
        throw new APIError("Only creators can toggle view", 403);
      }

      user.currentView =
        user.currentView === "consumer" ? "creator" : "consumer";
      await user.save();

      return user;
    } catch (error) {
      throw new APIError(error.message, 400);
    }
  }

  async upgradeToCreator(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new APIError("User not found", 404);
      }

      user.role = "creator";
      user.currentView = "creator";
      await user.save();

      return user;
    } catch (error) {
      throw new APIError(error.message, 400);
    }
  }
}

export default new UserService();
