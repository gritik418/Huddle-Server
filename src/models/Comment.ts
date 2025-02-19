import mongoose, { Model, Schema, Types } from "mongoose";

const CommentSchema = new Schema<Comment>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
    },
    postId: {
      type: Types.ObjectId,
      ref: "Post",
    },
    content: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    mentions: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: Types.ObjectId,
        ref: "CommentReply",
      },
    ],
  },
  { timestamps: true }
);

const Comment: Model<Comment> =
  mongoose.models.Comment || mongoose.model("Comment", CommentSchema);

export default Comment;
