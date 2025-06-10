import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("5000"),
  FRONTEND_URL: z.string().url(),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters long"),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[hdwmy]$/, "Invalid JWT expiration format"),
  MONGODB_URI: z.string().url(),
  MAX_FILE_SIZE: z.string().transform(Number).default("5242880"),
});

export const validateEnv = () => {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    console.error("❌ Invalid environment variables:", error.errors);
    process.exit(1);
  }
};
