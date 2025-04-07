import mongoose, { Schema, Types } from "mongoose";
const ChannelInviteSchema = new Schema({
    channelId: {
        type: Types.ObjectId,
        ref: "Channel",
    },
    receiverId: {
        type: Types.ObjectId,
        ref: "User",
    },
    senderId: {
        type: Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
}, { timestamps: true });
const ChannelInvite = mongoose.models.ChannelInvite ||
    mongoose.model("ChannelInvite", ChannelInviteSchema);
export default ChannelInvite;
