import mongoose, { Schema, Types } from "mongoose";
import AttachmentSchema from "./Attachment.js";
const MessageSchema = new Schema({
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
});
const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);
export default Message;
