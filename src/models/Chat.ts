import mongoose, { Model, Schema, Types } from "mongoose";

const ChatSchema = new Schema<Chat>(
  {
    isGroupChat: {
      type: Boolean,
      required: true,
      default: false,
    },
    groupName: {
      type: String,
    },
    groupIcon: {
      type: String,
    },
    groupDescription: {
      type: String,
    },
    admins: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

const Chat: Model<Chat> =
  mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

export default Chat;
