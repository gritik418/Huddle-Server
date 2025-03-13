import Message from "../../models/Message.js";
import { ConnectedUsers } from "../socketServer.js";
import { MESSAGE_SENT, NEW_MESSAGE } from "../../constants/events.js";
import Chat from "../../models/Chat.js";
export const sendMessageHandler = async (io, socket, message, chat) => {
    try {
        const newMessage = new Message({
            chatId: message.chatId,
            attachment: message?.attachment,
            content: message.content,
            readAt: null,
            sentAt: Date.now(),
            sender: socket.user.id,
            status: "sent",
        });
        const savedMessage = await newMessage.save();
        await Chat.findByIdAndUpdate(chat._id, {
            $set: { lastMessage: savedMessage._id },
        });
        const modifiedMessage = {
            _id: savedMessage._id.toString(),
            chatId: message.chatId,
            attachment: savedMessage?.attachment,
            content: savedMessage.content,
            readAt: savedMessage.readAt,
            sentAt: savedMessage.sentAt,
            sender: {
                _id: socket.user.id,
                firstName: socket.user.firstName,
                lastName: socket.user.lastName,
                username: socket.user.username,
                profilePicture: socket.user.profilePicture,
            },
            status: savedMessage.status,
        };
        chat.members.forEach((memberId) => {
            if (memberId.toString() === socket.user.id)
                return;
            const receiver = ConnectedUsers.get(memberId.toString());
            if (receiver) {
                io.to(receiver.id).emit(NEW_MESSAGE, {
                    message: modifiedMessage,
                    chat: chat,
                });
            }
        });
        socket.emit(MESSAGE_SENT, { message: modifiedMessage });
    }
    catch (error) {
        console.error("Error sending message:", error);
    }
};
