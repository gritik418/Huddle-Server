import { Request, Response } from "express";
import FollowRequest from "../models/FollowRequest.js";

export const getFollowRequests = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    const requests: FollowRequest[] = await FollowRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "_id firstName lastName username profilePicture");

    if (requests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No follow requests at the moment.",
      });
    }

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

// Pending
export const sendFollowRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    return res.status(200).json({
      success: true,
      message: "Follow request sent.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
