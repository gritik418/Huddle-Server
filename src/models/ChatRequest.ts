import { model, Model, models, Schema, Types } from "mongoose";

const ChatRequestSchema = new Schema<ChatRequest>(
  {
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ChatRequest: Model<ChatRequest> =
  models.User || model("ChatRequest", ChatRequestSchema);

export default ChatRequest;
