import User from "../models/User.js";
import Chat from "../models/Chat.js";
import ChatRequest from "../models/ChatRequest.js";
export const searchUsers = async (req, res) => {
    try {
        const userId = req.params.userId;
        const searchQuery = req.query["q"]?.toString();
        if (!searchQuery || searchQuery.length < 3)
            return res.status(200).json({
                success: true,
                message: "Please enter at least 3 characters to start your search.",
            });
        if (!userId)
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        const chats = await Chat.find({
            isGroupChat: false,
            members: { $in: [userId] },
        });
        const alreadyAdded = chats.map((chat) => {
            return chat.members
                .map((member) => member.toString())
                .find((member) => member !== userId);
        });
        const users = await User.find({
            _id: { $nin: [...alreadyAdded, userId] },
            $or: [
                {
                    email: { $regex: searchQuery, $options: "i" },
                },
                {
                    username: { $regex: searchQuery, $options: "i" },
                },
                {
                    firstName: { $regex: searchQuery, $options: "i" },
                },
            ],
            isVerified: true,
        }).select({
            _id: 1,
            email: 1,
        });
        if (users.length === 0)
            return res.status(200).json({
                success: true,
                message: "No users match your search criteria.",
            });
        return res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const sendChatRequest = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { receiverId } = req.body;
        if (!userId)
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        if (!receiverId)
            return res.status(400).json({
                success: false,
                message: "Receiver Id is required.",
            });
        const receiver = await User.findById(receiverId);
        if (!receiver)
            return res.status(400).json({
                success: false,
                message: "User not found.",
            });
        const existingChat = await Chat.findOne({
            isGroupChat: false,
            members: { $all: [userId, receiverId] },
        });
        if (existingChat)
            return res.status(400).json({
                success: false,
                message: "Chat already exists between you and this user.",
            });
        const existingRequest = await ChatRequest.findOne({
            sender: userId,
            receiver: receiverId,
            status: "pending",
        });
        if (existingRequest)
            return res.status(400).json({
                success: false,
                message: "You already have a pending chat request with this user.",
            });
        const chatRequest = new ChatRequest({
            receiver: receiverId,
            sender: userId,
            status: "pending",
        });
        await chatRequest.save();
        return res.status(200).json({
            success: true,
            message: "Chat request sent.",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
