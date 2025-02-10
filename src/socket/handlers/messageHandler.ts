import { Socket } from "socket.io";
import Message from "../../models/Message.js";
import { ConnectedUsers } from "../socketServer.js";
import { MESSAGE_SENT, NEW_MESSAGE } from "../../constants/events.js";

export const sendMessageHandler = async (
  socket: Socket,
  message: Message,
  chat: Chat
) => {
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
  chat.members.forEach((memberId) => {
    if (memberId.toString() === socket.user.id) return;

    const receiver = ConnectedUsers.get(memberId.toString());
    if (receiver) {
      socket.to(receiver).emit(NEW_MESSAGE, {
        message: savedMessage,
      });
    }
  });

  socket.emit(MESSAGE_SENT, { message: savedMessage });
};
