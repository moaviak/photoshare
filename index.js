import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/mongodb.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { logger } from "./src/utils/errorHandler.js";
import { validateEnv } from "./src/utils/validateEnv.js";
import { startCleanupTask } from "./src/utils/cleanup.js";

// Load and validate environment variables
dotenv.config();
const env = validateEnv();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB()
  .then(() => {
    logger.info("MongoDB connected successfully");
  })
  .catch((error) => {
    logger.error("MongoDB connection error", error);
    process.exit(1);
  });

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet()); // Security headers
if (env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);

// Serve uploaded files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, path) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request`, {
    path: req.path,
    query: req.query,
    ip: req.ip,
  });
  next();
});

// Routes
import authRoutes from "./src/routes/authRoutes.js";
import photoRoutes from "./src/routes/photoRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/photos", photoRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "frontend/dist")));

// Catch-all route to serve index.html for React routes
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
  startCleanupTask();
});
