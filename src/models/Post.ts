import mongoose, { Model, Schema, Types } from "mongoose";

const PostSchema = new Schema<Post>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrls: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
    },
    mentions: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    hashtags: [
      {
        type: String,
      },
    ],
    comments: [
      {
        type: Types.ObjectId,
        ref: "Comment",
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

const Post: Model<Post> =
  mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;
