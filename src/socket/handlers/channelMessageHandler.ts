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

    channel.members.forEach((member: ChannelMember) => {
      if (member._id.toString() === socket.user.id) return;

      const receiver = ConnectedUsers.get(member._id.toString());
      if (receiver) {
        io.to(receiver.id).emit(NEW_CHANNEL_MESSAGE, {
          message: savedMessage,
          channel: channel,
        });
      }
    });

    socket.emit(CHANNEL_MESSAGE_SENT, { message: savedMessage });
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
