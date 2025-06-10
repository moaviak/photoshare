import { fileService } from "../services/fileService.js";
import { logger } from "./errorHandler.js";

// Run cleanup every 24 hours
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;

export const startCleanupTask = () => {
  // Run initial cleanup
  fileService.cleanupOrphanedFiles().catch((error) => {
    logger.error("Initial cleanup task failed:", error);
  });

  // Schedule periodic cleanup
  setInterval(() => {
    fileService.cleanupOrphanedFiles().catch((error) => {
      logger.error("Scheduled cleanup task failed:", error);
    });
  }, CLEANUP_INTERVAL);

  logger.info("File cleanup task scheduled");
};
