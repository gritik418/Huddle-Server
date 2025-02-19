import mongoose, { Model, Schema, Types } from "mongoose";

const CommentReplySchema = new Schema<CommentReply>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
    commentId: {
      type: Types.ObjectId,
      ref: "Comment",
    },
    content: {
      type: String,
      required: true,
    },
    mentions: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const CommentReply: Model<CommentReply> =
  mongoose.models.CommentReply ||
  mongoose.model("CommentReply", CommentReplySchema);

export default CommentReply;
