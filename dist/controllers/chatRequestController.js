import User from "../models/User.js";
import Chat from "../models/Chat.js";
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
