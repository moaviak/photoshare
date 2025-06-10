import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    photo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
commentSchema.index({ photo: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
