import mongoose, { Model, Schema, Types } from "mongoose";
import AttachmentSchema from "./Attachment.js";

const MessageSchema = new Schema<Message>(
  {
    chatId: {
      type: Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
    },
    attachment: [AttachmentSchema],
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    sentAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    deletedFor: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Message: Model<Message> =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
