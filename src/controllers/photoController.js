import { v4 as uuidv4 } from "uuid";
import Photo from "../models/Photo.js";
import User from "../models/User.js";
import { fileService } from "../services/fileService.js";
import { APIError, FileError, logger } from "../utils/errorHandler.js";
import crypto from "crypto";

export const photoController = {
  async uploadPhoto(req, res) {
    try {
      const { title, caption, tags } = req.body;
      const file = req.file;

      // Validate file
      await fileService.validatePhotoFile(file);

      // Generate unique filename
      const filename = crypto.randomBytes(16).toString("hex");

      // Process and save photo
      const { imageUrl, thumbnailUrl } = await fileService.savePhoto(
        file,
        filename
      );

      // Create photo document
      const photo = await Photo.create({
        title,
        caption,
        tags: tags,
        imageUrl,
        thumbnailUrl,
        createdBy: req.user._id,
      });

      logger.info("Successfully uploaded photo", {
        photoId: photo._id,
        userId: req.user._id,
      });

      return res.status(201).json({
        success: true,
        data: photo,
      });
    } catch (error) {
      if (error instanceof FileError) {
        logger.error("File processing error", error, {
          userId: req.user?.id,
          filename: error.filename,
        });
        return res.status(error.statusCode).json({
          success: false,
          error: error.message,
          filename: error.filename,
        });
      }

      logger.error("Photo upload error", error, { userId: req.user?.id });
      return res.status(500).json({
        success: false,
        error: "Failed to upload photo",
      });
    }
  },

  async getPhotos(req, res) {
    try {
      const { page = 1, limit = 10, tag } = req.query;
      const query = tag ? { tags: tag } : {};

      const [photos, total] = await Promise.all([
        Photo.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate("createdBy", "name"),
        Photo.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          photos,
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("Error fetching photos", error);

      return res.status(500).json({
        success: false,
        error: "Failed to fetch photos",
      });
    }
  },

  async getPhotoById(req, res) {
    try {
      const { id } = req.params;
      const photo = await Photo.findById(id)
        .populate("createdBy", "name")
        .populate("comments.author", "name email profilePicture");

      if (!photo) {
        return res.status(404).json({
          success: false,
          error: "Photo not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: photo,
      });
    } catch (error) {
      logger.error("Error fetching photo", error, { photoId: req.params.id });

      return res.status(500).json({
        success: false,
        error: "Failed to fetch photo",
      });
    }
  },

  async updatePhoto(req, res) {
    try {
      const { id } = req.params;
      const { title, caption, tags } = req.body;

      const photo = await Photo.findOneAndUpdate(
        { _id: id, createdBy: req.user.id },
        {
          title,
          caption,
          tags: tags ? tags.split(",").map((tag) => tag.trim()) : undefined,
        },
        { new: true }
      );

      if (!photo) {
        return res.status(404).json({
          success: false,
          error: "Photo not found or access denied",
        });
      }

      logger.info("Successfully updated photo", {
        photoId: id,
        userId: req.user.id,
      });

      return res.status(200).json({
        success: true,
        data: photo,
      });
    } catch (error) {
      logger.error("Photo update error", error, {
        photoId: req.params.id,
        userId: req.user.id,
      });

      return res.status(500).json({
        success: false,
        error: "Failed to update photo",
      });
    }
  },

  async deletePhoto(req, res) {
    try {
      const { id } = req.params;
      const photo = await Photo.findOne({ _id: id, createdBy: req.user._id });

      if (!photo) {
        return res.status(404).json({
          success: false,
          error: "Photo not found or access denied",
        });
      }

      // Delete files first
      const filename = photo.imageUrl.split("/").pop();
      await fileService.deletePhoto(filename);

      // Then delete database record
      await photo.deleteOne();

      logger.info("Successfully deleted photo", {
        photoId: id,
        userId: req.user.id,
      });

      return res.status(200).json({
        success: true,
        message: "Photo deleted successfully",
      });
    } catch (error) {
      logger.error("Photo deletion error", error, {
        photoId: req.params.id,
        userId: req.user.id,
      });

      return res.status(500).json({
        success: false,
        error: "Failed to delete photo",
      });
    }
  },

  async ratePhoto(req, res) {
    try {
      const { id } = req.params;
      const { score } = req.body;
      const userId = req.user._id;

      const photo = await Photo.findById(id);
      if (!photo) {
        return res.status(404).json({
          success: false,
          error: "Photo not found",
        });
      }

      // Remove existing rating if any
      const ratingIndex = photo.ratings.findIndex(
        (r) => r.user.toString() === userId
      );
      if (ratingIndex > -1) {
        photo.ratings.splice(ratingIndex, 1);
      }

      // Add new rating
      photo.ratings.push({
        score,
        user: userId,
      });

      // Update average rating
      const totalScore = photo.ratings.reduce((sum, r) => sum + r.score, 0);
      photo.averageRating = totalScore / photo.ratings.length;

      await photo.save();

      logger.info("Successfully rated photo", {
        photoId: id,
        userId,
        score,
      });

      return res.status(200).json({
        success: true,
        data: {
          averageRating: photo.averageRating,
          totalRatings: photo.ratings.length,
        },
      });
    } catch (error) {
      logger.error("Photo rating error", error, {
        photoId: req.params.id,
        userId: req.user.id,
      });

      return res.status(500).json({
        success: false,
        error: "Failed to rate photo",
      });
    }
  },

  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const userId = req.user._id;

      const photo = await Photo.findById(id);
      if (!photo) {
        return res.status(404).json({
          success: false,
          error: "Photo not found",
        });
      }

      const comment = {
        text,
        author: userId,
        createdAt: new Date(),
      };

      photo.comments.push(comment);
      await photo.save();

      // Populate author details for the new comment
      const populatedPhoto = await Photo.findById(id).populate(
        "comments.author",
        "name"
      );

      const newComment =
        populatedPhoto.comments[populatedPhoto.comments.length - 1];

      logger.info("Successfully added comment", {
        photoId: id,
        userId,
        commentId: newComment._id,
      });

      return res.status(201).json({
        success: true,
        data: newComment,
      });
    } catch (error) {
      logger.error("Comment creation error", error, {
        photoId: req.params.id,
        userId: req.user.id,
      });

      return res.status(500).json({
        success: false,
        error: "Failed to add comment",
      });
    }
  },

  async deleteComment(req, res) {
    try {
      const { id, commentId } = req.params;
      const userId = req.user.id;

      const photo = await Photo.findById(id);
      if (!photo) {
        return res.status(404).json({
          success: false,
          error: "Photo not found",
        });
      }

      const comment = photo.comments.id(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          error: "Comment not found",
        });
      }

      // Check if user is comment author or photo owner
      if (
        comment.author.toString() !== userId &&
        photo.createdBy.toString() !== userId
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to delete this comment",
        });
      }

      comment.deleteOne();
      await photo.save();

      logger.info("Successfully deleted comment", {
        photoId: id,
        commentId,
        userId,
      });

      return res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      logger.error("Comment deletion error", error, {
        photoId: req.params.id,
        commentId: req.params.commentId,
        userId: req.user.id,
      });

      return res.status(500).json({
        success: false,
        error: "Failed to delete comment",
      });
    }
  },
};
