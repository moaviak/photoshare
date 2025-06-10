import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default in queries
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    role: {
      type: String,
      enum: ["consumer", "creator"],
      default: "consumer",
    },
    currentView: {
      type: String,
      enum: ["consumer", "creator"],
      default: "consumer",
    },
    photoCount: {
      type: Number,
      default: 0,
    },
    maxPhotos: {
      type: Number,
      default: 50, // Default limit for creators
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Index for performance
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Load password field for comparison
    const user = await this.model("User")
      .findById(this._id)
      .select("+password");
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to check if user can upload more photos
userSchema.methods.canUploadMore = function () {
  return this.role === "creator" && this.photoCount < this.maxPhotos;
};

// Increment photo count
userSchema.methods.incrementPhotoCount = async function () {
  this.photoCount += 1;
  await this.save();
};

// Decrement photo count
userSchema.methods.decrementPhotoCount = async function () {
  this.photoCount = Math.max(0, this.photoCount - 1);
  await this.save();
};

const User = mongoose.model("User", userSchema);

export default User;
