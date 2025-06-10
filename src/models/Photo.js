import mongoose from "mongoose";

const photoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: 30,
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ratings: [
      {
        score: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
photoSchema.index({ createdAt: -1 });
photoSchema.index({ tags: 1 });
photoSchema.index({ averageRating: -1 });

// Ensure a user can only rate once
photoSchema.index({ "ratings.user": 1, _id: 1 }, { unique: true });

// Virtual for generating optimized image URLs
photoSchema.virtual("optimizedImageUrl").get(function () {
  return this.imageUrl;
});

photoSchema.virtual("optimizedThumbnailUrl").get(function () {
  return this.thumbnailUrl;
});

// Clean up old values when updating
photoSchema.pre("save", function (next) {
  // Limit number of tags
  if (this.tags && this.tags.length > 10) {
    this.tags = this.tags.slice(0, 10);
  }

  // Remove duplicate tags
  if (this.tags) {
    this.tags = [...new Set(this.tags)];
  }

  // Ensure comments don't exceed limit
  const MAX_COMMENTS = 100;
  if (this.comments && this.comments.length > MAX_COMMENTS) {
    this.comments = this.comments.slice(-MAX_COMMENTS);
  }

  next();
});

const Photo = mongoose.model("Photo", photoSchema);

export default Photo;
