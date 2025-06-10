import { z } from "zod";

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Auth token schema for validation
export const tokenSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(["consumer", "creator"]),
  currentView: z.enum(["consumer", "creator"]),
  iat: z.number(),
  exp: z.number(),
});

// Photo validation schemas
export const photoUploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  caption: z
    .string()
    .max(500, "Caption cannot exceed 500 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location cannot exceed 100 characters")
    .optional(),
  tags: z
    .string()
    .max(300, "Tags string cannot exceed 300 characters")
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag.length > 0 && tag.length <= 30)
            .slice(0, 10)
        : []
    ),
  isPublic: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export const photoUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters")
    .optional(),
  caption: z
    .string()
    .max(500, "Caption cannot exceed 500 characters")
    .optional(),
  location: z
    .string()
    .max(100, "Location cannot exceed 100 characters")
    .optional(),
  tags: z
    .string()
    .max(300, "Tags string cannot exceed 300 characters")
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag.length > 0 && tag.length <= 30)
            .slice(0, 10)
        : undefined
    ),
  isPublic: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

// Rating validation schema
export const ratingSchema = z.object({
  score: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
});

// Comment validation schemas
export const commentCreateSchema = z.object({
  text: z
    .string()
    .min(1, "Comment text is required")
    .max(500, "Comment cannot exceed 500 characters"),
});

// Query params validation
export const photoQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val) || 1),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val) || 10),
  tags: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : [])),
  userId: z.string().optional(),
});
