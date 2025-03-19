import mongoose, { Model, Schema, Types } from "mongoose";

const ChannelSchema = new Schema<Channel>(
  {
    creatorId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["public", "private", "invite-only"],
      default: "public",
    },
    sendMessagePermission: {
      type: String,
      enum: ["creator", "members", "everyone"],
      default: "members",
    },
  },
  { timestamps: true }
);

const Channel: Model<Channel> =
  mongoose.models.Channel || mongoose.model("Channel", ChannelSchema);

export default Channel;
