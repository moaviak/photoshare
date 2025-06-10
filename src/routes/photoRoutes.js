import express from "express";
import { photoController } from "../controllers/photoController.js";
import { auth } from "../middlewares/auth.js";
import { uploadPhoto } from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";
import {
  photoUploadSchema,
  photoUpdateSchema,
  ratingSchema,
  commentCreateSchema,
} from "../validators/schemas.js";
import { creatorOnly } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/", auth, photoController.getPhotos);
router.get("/:id", auth, photoController.getPhotoById);

// Creator only routes
router.post(
  "/",
  auth,
  creatorOnly,
  uploadPhoto,
  validate(photoUploadSchema),
  photoController.uploadPhoto
);

router.patch(
  "/:id",
  auth,
  creatorOnly,
  validate(photoUpdateSchema),
  photoController.updatePhoto
);

router.delete("/:id", auth, creatorOnly, photoController.deletePhoto);

// Consumer interaction routes
router.post(
  "/:id/rate",
  auth,
  validate(ratingSchema),
  photoController.ratePhoto
);

router.post(
  "/:id/comments",
  auth,
  validate(commentCreateSchema),
  photoController.addComment
);

router.delete("/:id/comments/:commentId", auth, photoController.deleteComment);

export default router;
