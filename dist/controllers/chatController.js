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
        })
            .populate("members", "_id firstName lastName username profilePicture")
            .sort({ updatedAt: -1 });
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
// export const clearChat = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const userId: string = req.params.userId;
//     const chatId: string = req.params.chatId;
//     if (!userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Please Login.",
//       });
//     }
//     if (!chatId) {
//       return res.status(400).json({
//         success: false,
//         message: "Chat Id is required.",
//       });
//     }
//     await Message.updateMany({
//       chatId,
//     },{
//       $push: {}
//     });
//     return res.status(200).json({
//       success: true,
//       message: "Chat cleared successfully.",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Unexpected server error. Please try again later.",
//     });
//   }
// };
