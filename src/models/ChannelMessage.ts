import mongoose, { Model, Schema, Types } from "mongoose";
import AttachmentSchema from "./Attachment.js";

const ChannelMessageSchema = new Schema<ChannelMessage>(
  {
    channelId: {
      type: Types.ObjectId,
      ref: "Channel",
    },
    content: {
      type: String,
    },
    attachment: [AttachmentSchema],

    sentAt: {
      type: Date,
    },
    deletedFor: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "failed"],
      default: "sent",
    },
  },
  { timestamps: true }
);

const ChannelMessage: Model<ChannelMessage> =
  mongoose.models.ChannelMessage ||
  mongoose.model("ChannelMessage", ChannelMessageSchema);

export default ChannelMessage;
