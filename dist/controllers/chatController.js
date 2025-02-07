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
