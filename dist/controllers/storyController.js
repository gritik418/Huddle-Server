import Story from "../models/Story.js";
import User from "../models/User.js";
export const getFollowingsStories = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const user = await User.findById(userId).select("following");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        const stories = await Story.find({
            userId: { $in: user.following },
            expiresAt: { $gt: new Date() },
        })
            .sort({ createdAt: -1 })
            .populate("userId", "_id firstName lastName username profilePicture");
        return res.status(200).json({
            success: true,
            stories,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const addStory = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Missing file.",
            });
        }
        const { caption } = req.body;
        const fileUrl = `${process.env.BASE_URL}/uploads/${userId}/story/${req.file.filename}`;
        const mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
        await Story.create({
            userId,
            caption,
            mediaUrl: fileUrl,
            mediaType,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        return res.status(201).json({
            success: true,
            message: "Story added successfully.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
