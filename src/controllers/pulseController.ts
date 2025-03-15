import { Request, Response } from "express";
import Pulse from "../models/Pulse.js";

export const addPulse = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    if (!content)
      return res.status(400).json({
        success: false,
        message: "Please provide the content for your Pulse.",
      });

    const pulse = new Pulse({
      userId,
      content,
    });

    await pulse.save();

    return res.status(201).json({
      success: true,
      message: "Your Pulse has been posted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
