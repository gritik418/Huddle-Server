import { Server, Socket } from "socket.io";
import ChannelMessage from "../../models/ChannelMessage.js";
import { ConnectedUsers } from "../socketServer.js";
import {
  CHANNEL_MESSAGE_SENT,
  NEW_CHANNEL_MESSAGE,
} from "../../constants/events.js";

export const sendChannelMessageHandler = async (
  io: Server,
  socket: Socket,
  channel: Channel,
  content: string
): Promise<void> => {
  try {
    const newMessage = new ChannelMessage({
      channelId: channel._id,
      content: content,
      sender: socket.user.id,
      sentAt: Date.now(),
      status: "sent",
    });

    const savedMessage = await newMessage.save();

    const modifiedMessage = {
      _id: savedMessage._id.toString(),
      channelId: channel._id,
      attachment: savedMessage?.attachment,
      content: savedMessage.content,
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

    channel.members.forEach((member: ChannelMember) => {
      if (member._id.toString() === socket.user.id) return;
      const receiver = ConnectedUsers.get(member._id.toString());

      if (receiver) {
        io.to(receiver.id).emit(NEW_CHANNEL_MESSAGE, {
          message: modifiedMessage,
          channel: channel,
        });
      }
    });

    socket.emit(CHANNEL_MESSAGE_SENT, { message: modifiedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
