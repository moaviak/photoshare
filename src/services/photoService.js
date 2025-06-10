import Photo from "../models/Photo.js";
import Comment from "../models/Comment.js";
import fileService from "./fileService.js";
import { APIError } from "../utils/errorHandler.js";

class PhotoService {
  async uploadPhoto(
    file,
    userId,
    { title, caption, location, tags = [], isPublic = true }
  ) {
    try {
      // Upload file to local storage
      const { fileId, fileUrl } = await fileService.saveFile(file);

      // Create photo document in MongoDB
      const photo = await Photo.create({
        title,
        caption,
        location,
        fileId,
        imageUrl: fileUrl,
        tags,
        createdBy: userId,
        isPublic,
      });

      return photo;
    } catch (error) {
      // Clean up file if MongoDB save fails
      if (error.fileId) {
        await fileService.deleteFile(error.fileId);
      }
      throw new APIError(`Photo upload failed: ${error.message}`, 500);
    }
  }

  async getPhotos({ page = 1, limit = 10, tags = [], userId = null }) {
    try {
      const skip = (page - 1) * limit;
      let query = { isPublic: true };

      if (tags.length > 0) {
        query.tags = { $in: tags };
      }

      if (userId) {
        query.createdBy = userId;
      }

      const photos = await Photo.find(query)
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Photo.countDocuments(query);

      return {
        photos,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new APIError(`Failed to fetch photos: ${error.message}`, 500);
    }
  }

  async getPhotoById(photoId) {
    try {
      const photo = await Photo.findById(photoId)
        .populate("createdBy", "name")
        .populate({
          path: "comments",
          populate: {
            path: "author",
            select: "name",
          },
        });

      if (!photo) {
        throw new APIError("Photo not found", 404);
      }

      return photo;
    } catch (error) {
      throw new APIError(
        `Failed to fetch photo: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  async updatePhoto(photoId, userId, updates) {
    try {
      const photo = await Photo.findById(photoId);

      if (!photo) {
        throw new APIError("Photo not found", 404);
      }

      if (photo.createdBy.toString() !== userId.toString()) {
        throw new APIError("Unauthorized to update this photo", 403);
      }

      Object.assign(photo, updates);
      await photo.save();

      return photo;
    } catch (error) {
      throw new APIError(
        `Failed to update photo: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  async deletePhoto(photoId, userId) {
    try {
      const photo = await Photo.findById(photoId);

      if (!photo) {
        throw new APIError("Photo not found", 404);
      }

      if (photo.createdBy.toString() !== userId.toString()) {
        throw new APIError("Unauthorized to delete this photo", 403);
      }

      // Delete file from storage
      await fileService.deleteFile(photo.fileId);

      // Delete all comments associated with the photo
      await Comment.deleteMany({ photo: photoId });

      // Delete the photo document
      await photo.deleteOne();

      return true;
    } catch (error) {
      throw new APIError(
        `Failed to delete photo: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  async ratePhoto(photoId, userId, score) {
    try {
      const photo = await Photo.findById(photoId);

      if (!photo) {
        throw new APIError("Photo not found", 404);
      }

      const existingRatingIndex = photo.ratings.findIndex(
        (rating) => rating.user.toString() === userId.toString()
      );

      if (existingRatingIndex > -1) {
        photo.ratings[existingRatingIndex].score = score;
      } else {
        photo.ratings.push({ user: userId, score });
      }

      await photo.save();
      return photo;
    } catch (error) {
      throw new APIError(
        `Failed to rate photo: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  async addComment(photoId, userId, text) {
    try {
      const photo = await Photo.findById(photoId);

      if (!photo) {
        throw new APIError("Photo not found", 404);
      }

      const comment = await Comment.create({
        photo: photoId,
        author: userId,
        text,
      });

      await comment.populate("author", "name");

      return comment;
    } catch (error) {
      throw new APIError(
        `Failed to add comment: ${error.message}`,
        error.statusCode || 500
      );
    }
  }

  async deleteComment(commentId, userId) {
    try {
      const comment = await Comment.findById(commentId);

      if (!comment) {
        throw new APIError("Comment not found", 404);
      }

      if (comment.author.toString() !== userId.toString()) {
        throw new APIError("Unauthorized to delete this comment", 403);
      }

      await comment.deleteOne();
      return true;
    } catch (error) {
      throw new APIError(
        `Failed to delete comment: ${error.message}`,
        error.statusCode || 500
      );
    }
  }
}

export default new PhotoService();
