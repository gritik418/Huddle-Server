import mongoose, { model, Schema, Types } from "mongoose";
const FollowRequestSchema = new Schema({
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
}, { timestamps: true });
const FollowRequest = mongoose.models.FollowRequest || model("FollowRequest", FollowRequestSchema);
export default FollowRequest;
