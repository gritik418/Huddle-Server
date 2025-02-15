import User from "../models/User.js";
import { HUDDLE_TOKEN } from "../constants/variables.js";
import { cookieOptions } from "../constants/options.js";
export const getUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).clearCookie(HUDDLE_TOKEN, cookieOptions).json({
                success: false,
                message: "Please Login.",
            });
        }
        const user = await User.findById(userId).select({
            followRequests: 1,
            followers: 1,
            following: 1,
            _id: 1,
            firstName: 1,
            lastName: 1,
            username: 1,
            email: 1,
            posts: 1,
            friendRequests: 1,
            friends: 1,
            blockedUsers: 1,
        });
        if (!user || !user._id) {
            return res.status(401).clearCookie(HUDDLE_TOKEN, cookieOptions).json({
                success: false,
                message: "Please Login.",
            });
        }
        return res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getFollowing = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).clearCookie(HUDDLE_TOKEN, cookieOptions).json({
                success: false,
                message: "Please Login.",
            });
        }
        const user = await User.findById(userId)
            .select({
            following: 1,
            _id: 1,
        })
            .populate("following", "_id firstName lastName username profilePicture");
        if (!user || !user._id) {
            return res.status(401).clearCookie(HUDDLE_TOKEN, cookieOptions).json({
                success: false,
                message: "Please Login.",
            });
        }
        return res.status(200).json({
            success: true,
            following: user.following,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getFollowers = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(401).clearCookie(HUDDLE_TOKEN, cookieOptions).json({
                success: false,
                message: "Please Login.",
            });
        }
        const user = await User.findById(userId)
            .select({
            followers: 1,
            _id: 1,
        })
            .populate("followers", "_id firstName lastName username profilePicture");
        if (!user || !user._id) {
            return res.status(401).clearCookie(HUDDLE_TOKEN, cookieOptions).json({
                success: false,
                message: "Please Login.",
            });
        }
        return res.status(200).json({
            success: true,
            followers: user.followers,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
