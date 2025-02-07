import { Request, Response } from "express";
import Message from "../models/Message.js";

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
    });

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
