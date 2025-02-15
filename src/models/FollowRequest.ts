import mongoose, { model, Model, Schema, Types } from "mongoose";

const FollowRequestSchema = new Schema<FollowRequest>(
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

const FollowRequest: Model<FollowRequest> =
  mongoose.models.FollowRequest || model("FollowRequest", FollowRequestSchema);

export default FollowRequest;
