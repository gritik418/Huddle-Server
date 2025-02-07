import mongoose, { Schema, Types } from "mongoose";
const UserSchema = new Schema({
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
        default: "credentials",
    },
    posts: [
        {
            type: Types.ObjectId,
            ref: "Post",
        },
    ],
    followRequests: [
        {
            type: Types.ObjectId,
            ref: "User",
        },
    ],
    followers: [
        {
            type: Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
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
}, { timestamps: true });
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
