import { Request, Response } from "express";
import Message from "../models/Message.js";
import { Socket } from "socket.io";
import { ConnectedUsers } from "../socket/socketServer.js";
import { UNSEND_MESSAGE } from "../constants/events.js";

export const getMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const chatId: string = req.params.chatId;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    const messages: Message[] = await Message.find({
      chatId,
    }).populate("sender", "_id firstName lastName username profilePicture");

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const deleteForMe = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const messageId: string = req.params.messageId;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message not found.",
      });
    }

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Message marked as deleted for you.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const unsendMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const messageId: string = req.params.messageId;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    const message: Message | null = await Message.findById(messageId).populate(
      "chatId",
      "members"
    );
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message not found.",
      });
    }

    await Message.findByIdAndDelete(messageId);

    message.chatId.members.map((member: string) => {
      if (member.toString() === userId) return;

      const userSocket: Socket | undefined = ConnectedUsers.get(
        member.toString()
      );
      if (userSocket && userSocket.id) {
        userSocket.emit(UNSEND_MESSAGE, {
          chatId: message.chatId._id,
          messageId: message._id,
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Message successfully deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
