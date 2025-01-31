import mongoose, { Model, Schema, Types } from "mongoose";

const UserSchema = new Schema<User>(
  {
    firstName: {
      type: String,
      minlength: 3,
      required: true,
    },
    lastName: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
    },
    password: {
      type: String,
      select: false,
    },
    bio: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
    },
    posts: [
      {
        type: Types.ObjectId,
        ref: "Post",
      },
    ],
    friendRequests: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    friends: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    blockedUsers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    verificationCode: {
      type: String,
    },
    verificationCodeExpiry: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User: Model<User> =
  mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
