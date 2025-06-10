import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
  upgradeToCreator,
  toggleView,
} from "../controllers/authController.js";
import { auth as authMiddleware } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema, loginSchema } from "../validators/schemas.js";

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

// Protected routes
router.use(authMiddleware);
router.get("/me", getCurrentUser);
router.post("/upgrade-to-creator", upgradeToCreator);
router.post("/toggle-view", toggleView);

export default router;
