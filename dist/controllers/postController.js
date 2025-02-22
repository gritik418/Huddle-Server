import multer from "multer";
import Post from "../models/Post.js";
import postSchema from "../validators/postSchema.js";
import User from "../models/User.js";
import { ConnectedUsers } from "../socket/socketServer.js";
import { NEW_MENTION } from "../constants/events.js";
export const addPost = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(req.body);
        const data = req.body;
        const mediaUrls = [];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const result = postSchema.safeParse(data);
        if (!result.success) {
            const errors = {};
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
            req.files.forEach((file) => {
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
        const user = await User.findById(userId);
        result.data.mentions?.forEach((mention) => {
            const receiverSocket = ConnectedUsers.get(mention.toString());
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
    }
    catch (error) {
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
export const getPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getPostById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const postId = req.params.postId;
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getPostsByFollowing = async (req, res) => {
    try {
        const userId = req.params.userId;
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
        }).populate("userId", "_id firstName lastName username coverImage profilePicture");
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getFeed = async (req, res) => {
    try {
        const userId = req.params.userId;
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
        const publicUserIds = publicUsers.map((user) => user._id.toString());
        const totalPosts = await Post.countDocuments({
            userId: { $in: publicUserIds },
        });
        const totalPages = Math.ceil(totalPosts / +limit);
        const posts = await Post.find({
            userId: { $in: publicUserIds },
        })
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .populate("userId", "_id firstName lastName username coverImage profilePicture")
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
