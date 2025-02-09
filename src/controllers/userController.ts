import { Request, Response } from "express";
import User from "../models/User.js";

export const getUser = async (
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

    const user: User | null = await User.findById(userId).select({
      followRequests: 1,
      followers: 1,
      following: 1,
      _id: 1,
      firstName: 1,
      lastName: 1,
      username: 1,
      email: 1,
      posts: 1,
      friendRequests: 1,
      friends: 1,
      blockedUsers: 1,
    });

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
