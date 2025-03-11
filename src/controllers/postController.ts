import { Request, Response } from "express";
import multer from "multer";
import Post from "../models/Post.js";
import postSchema, { PostData } from "../validators/postSchema.js";
import User from "../models/User.js";
import { Socket } from "socket.io";
import { ConnectedUsers } from "../socket/socketServer.js";
import { NEW_MENTION } from "../constants/events.js";

export const addPost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.params.userId;
    const data: PostData = req.body;
    const mediaUrls: string[] = [];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const result = postSchema.safeParse(data);

    if (!result.success) {
      const errors: { [name: string]: string } = {};
      result.error.errors.forEach((error) => {
        errors[error.path[0]] = error.message;
      });

      return res.status(400).json({
        success: false,
        message: "Validation Error.",
        errors,
      });
    }

    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: Express.Multer.File) => {
        const filePath = `${process.env.BASE_URL}/uploads/${userId}/posts/${file.filename}`;
        mediaUrls.push(filePath);
      });
    }

    const post = new Post({
      userId,
      mediaUrls,
      hashtags: result.data.hashtags,
      mentions: result.data.mentions,
      location: result.data.location,
      content: result.data.content,
    });

    const savedPost = await post.save();
    const user = await User.findByIdAndUpdate(userId, {
      $push: { posts: savedPost._id },
    });

    result.data.mentions?.forEach((mention: string) => {
      const receiverSocket: Socket | undefined = ConnectedUsers.get(
        mention.toString()
      );

      if (receiverSocket && receiverSocket?.id) {
        receiverSocket.emit(NEW_MENTION, {
          postId: savedPost._id,
          creator: {
            _id: user?._id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username,
            profilePicture: user?.profilePicture,
          },
        });
      }
    });

    return res.status(201).json({
      success: true,
      message: "Post added.",
    });
  } catch (error) {
    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case "LIMIT_FILE_SIZE":
          return res.status(400).json({
            success: false,
            message: "File size is too large.",
          });
        case "LIMIT_FILE_COUNT":
          return res.status(400).json({
            success: false,
            message: "Too many files uploaded.",
          });
        case "LIMIT_UNEXPECTED_FILE":
          return res.status(400).json({
            success: false,
            message: "Unexpected file field.",
          });
        default:
          return res.status(400).json({
            success: false,
            message: "An error occurred during the file upload.",
          });
      }
    }
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.userId;

    const posts = await Post.find({ userId });

    if (!posts.length) {
      return res.status(200).json({
        success: true,
        message: "Oops! Looks like you haven't posted anything yet.",
      });
    }

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.userId;
    const postId: string = req.params.postId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post Id is required.",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Oops! Looks like this post doesn't exist.",
      });
    }

    return res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getPostsByFollowing = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const user = await User.findById(userId).select({ following: 1 });

    if (!user.following || user.following.length === 0) {
      return res.status(200).json({
        success: true,
        message: "You are not following anyone. No posts to show.",
      });
    }

    const posts = await Post.find({
      userId: { $in: user.following },
    }).populate(
      "userId",
      "_id firstName lastName username coverImage profilePicture"
    );

    if (!posts || posts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No posts from users you are following.",
      });
    }

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getFeed = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const publicUsers = await User.find({
      isPrivate: false,
      _id: { $ne: userId },
    }).select({
      _id: 1,
    });

    const publicUserIds: string[] = publicUsers.map((user) =>
      user._id.toString()
    );

    const totalPosts = await Post.countDocuments({
      userId: { $in: publicUserIds },
    });

    const totalPages = Math.ceil(totalPosts / +limit);

    const posts = await Post.find({
      userId: { $in: publicUserIds },
    })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .populate(
        "userId",
        "_id firstName lastName username coverImage profilePicture"
      )
      .sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No posts found.",
      });
    }

    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: +page,
        limit: +limit,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId: string = req.params.userId;
    const postId: string = req.params.postId;

    if (!postId)
      return res.status(400).json({
        success: false,
        message: "Post Id is required.",
      });

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({
        success: false,
        message: "Oops! Looks like this post doesn't exist.",
      });
    }

    if (post.userId.toString() !== userId) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to delete this post.",
      });
    }

    await Post.findByIdAndDelete(postId);
    await User.findByIdAndUpdate(userId, {
      $pull: { posts: postId },
    });

    return res.status(200).json({
      success: true,
      message: "Post successfully deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const likePost = async (req: Request, res: Response) => {
  try {
    const postId: string = req.params.postId;
    const userId: string = req.params.userId;

    if (!postId)
      return res.status(400).json({
        success: false,
        message: "Post Id is required.",
      });

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (post.likes.includes(userId)) {
      return res.status(200).json({
        success: true,
        message: "Post liked successfully.",
      });
    }

    await Post.findByIdAndUpdate(postId, {
      $push: { likes: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Post liked successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const unlikePost = async (req: Request, res: Response) => {
  try {
    const postId: string = req.params.postId;
    const userId: string = req.params.userId;

    if (!postId)
      return res.status(400).json({
        success: false,
        message: "Post Id is required.",
      });

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    if (!post.likes.includes(userId)) {
      return res.status(200).json({
        success: true,
        message: "Post unliked successfully.",
      });
    }

    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Post unliked successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
