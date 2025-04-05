import mongoose, { Model, Schema, Types } from "mongoose";

const JoinRequestSchema = new Schema<JoinRequest>(
  {
    channelId: {
      type: Types.ObjectId,
      ref: "Channel",
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const JoinRequest: Model<JoinRequest> =
  mongoose.models.JoinRequest ||
  mongoose.model("JoinRequest", JoinRequestSchema);

export default JoinRequest;
