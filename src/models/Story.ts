import mongoose, { Model, Schema, Types } from "mongoose";

const StorySchema = new Schema<Story>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
    caption: {
      type: String,
      trim: true,
    },
    mediaUrl: {
      type: String,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    viewers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Story: Model<Story> =
  mongoose.models.Story || mongoose.model("Story", StorySchema);

export default Story;
