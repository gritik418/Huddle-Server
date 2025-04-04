import User from "../models/User.js";
import Post from "../models/Post.js";
import Channel from "../models/Channel.js";
import mongoose from "mongoose";
export const search = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { page = 1, limit = 20 } = req.query;
        const searchQuery = req.query["q"]?.toString() || "";
        const type = req.query["type"]?.toString() || "accounts";
        const objectUserId = new mongoose.Types.ObjectId(userId);
        const currentUser = await User.findById(objectUserId).select("blockedUsers");
        const blockedByMe = currentUser?.blockedUsers.map((id) => id.toString()) || [];
        const blockedMeUsers = await User.find({
            blockedUsers: objectUserId,
        }).select("_id");
        const blockedMe = blockedMeUsers.map((u) => u._id);
        const excludedUserIds = [...blockedByMe, ...blockedMe, objectUserId];
        switch (type) {
            case "accounts":
                const totalUsers = await User.countDocuments({
                    $or: [
                        {
                            firstName: { $regex: searchQuery, $options: "i" },
                        },
                        {
                            lastName: { $regex: searchQuery, $options: "i" },
                        },
                        {
                            username: { $regex: searchQuery, $options: "i" },
                        },
                    ],
                    _id: { $nin: excludedUserIds },
                    isVerified: true,
                });
                const totalPages = Math.ceil(totalUsers / +limit);
                const users = await User.find({
                    $or: [
                        {
                            firstName: { $regex: searchQuery, $options: "i" },
                        },
                        {
                            lastName: { $regex: searchQuery, $options: "i" },
                        },
                        {
                            username: { $regex: searchQuery, $options: "i" },
                        },
                    ],
                    _id: { $nin: excludedUserIds },
                    isVerified: true,
                })
                    .select("_id firstName lastName username profilePicture")
                    .skip((+page - 1) * +limit)
                    .limit(+limit)
                    .sort({ createdAt: -1 });
                return res.status(200).json({
                    success: true,
                    users,
                    pagination: {
                        page: +page,
                        limit: +limit,
                        totalPages,
                    },
                });
            case "hashtags":
                const totalPosts = await Post.countDocuments({
                    $or: [
                        { isPrivate: false },
                        { followers: { $in: [userId] } },
                        { userId: { $eq: userId } },
                    ],
                    userId: { $nin: excludedUserIds },
                    hashtags: {
                        $elemMatch: { $regex: searchQuery, $options: "i" },
                    },
                });
                const totalPostPages = Math.ceil(totalPosts / +limit);
                const posts = await Post.find({
                    $or: [
                        { isPrivate: false },
                        { followers: { $in: [userId] } },
                        { userId: { $eq: userId } },
                    ],
                    userId: { $nin: excludedUserIds },
                    hashtags: {
                        $elemMatch: { $regex: searchQuery, $options: "i" },
                    },
                })
                    .skip((+page - 1) * +limit)
                    .limit(+limit)
                    .sort({ createdAt: -1 })
                    .populate("userId", "_id firstName lastName username coverImage profilePicture");
                return res.status(200).json({
                    success: true,
                    posts,
                    pagination: {
                        page: +page,
                        limit: +limit,
                        totalPages: totalPostPages,
                    },
                });
            case "channels":
                const totalChannels = await Channel.countDocuments({
                    isActive: true,
                    name: { $regex: searchQuery, $options: "i" },
                });
                const totalChannelPages = Math.ceil(totalChannels / +limit);
                const channels = await Channel.find({
                    isActive: true,
                    name: { $regex: searchQuery, $options: "i" },
                })
                    .populate("creatorId", "_id firstName lastName username profilePicture")
                    .populate("members", "_id firstName lastName username profilePicture coverImage")
                    .skip((+page - 1) * +limit)
                    .limit(+limit)
                    .sort({ createdAt: -1 });
                return res.status(200).json({
                    success: true,
                    channels,
                    pagination: {
                        page: +page,
                        limit: +limit,
                        totalPages: totalChannelPages,
                    },
                });
        }
        return res.status(400).json({
            success: false,
            message: "Please choose a valid type.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
