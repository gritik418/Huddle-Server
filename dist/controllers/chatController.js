import Chat from "../models/Chat.js";
export const getChats = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId)
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        const chats = await Chat.find({
            members: { $in: [userId] },
        });
        return res.status(200).json({
            success: true,
            chats,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const getChatById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const chatId = req.params.chatId;
        if (!userId)
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        const chat = await Chat.findById(chatId)
            .populate("members", "firstName lastName username _id profilePicture")
            .populate("admins", "firstName lastName username _id profilePicture");
        if (!chat)
            return res.status(400).json({
                success: false,
                message: "Chat not found.",
            });
        return res.status(200).json({
            success: true,
            chat,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
