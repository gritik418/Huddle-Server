import Message from "../models/Message.js";
export const getMessages = async (req, res) => {
    try {
        const userId = req.params.userId;
        const chatId = req.params.chatId;
        if (!userId)
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        const messages = await Message.find({
            chatId,
        }).populate("sender", "_id firstName lastName username profilePicture");
        return res.status(200).json({
            success: true,
            messages,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
