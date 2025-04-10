import { Request, Response } from "express";
import NotificationSettings from "../models/NotificationSettings.js";

export const getUserNotificationSettings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User not found.",
      });
    }

    const settings = await NotificationSettings.findOne({ userId });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Notification settings not found for this user.",
      });
    }

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
