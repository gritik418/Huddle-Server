import { Request, Response } from "express";
import Pulse from "../models/Pulse.js";
import User from "../models/User.js";

export const getAllPulses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const user: User | null = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const blockedUserIds: string[] = user.blockedUsers.map((id: string) =>
      id.toString()
    );

    const publicUsers = await User.find({
      $or: [
        { isPrivate: false },
        { followers: { $in: [userId] } },
        { _id: { $eq: userId } },
      ],
    }).select({
      _id: 1,
      blockedUsers: 1,
    });

    const publicUserIds: string[] = publicUsers
      .filter(
        (user) =>
          !user.blockedUsers
            .map((id: string) => id.toString())
            .includes(userId.toString())
      )
      .map((user) => user._id.toString())
      .filter((id: string) => !blockedUserIds.includes(id));

    const totalPulses = await Pulse.countDocuments({
      userId: { $in: publicUserIds },
    });

    const totalPages = Math.ceil(totalPulses / +limit);

    const pulses = await Pulse.find({ userId: { $in: publicUserIds } })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .populate(
        "userId",
        "_id firstName lastName username coverImage profilePicture"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      pulses,
      pagination: {
        page: +page,
        limit: +limit,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getUserPulses = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const totalPulses = await Pulse.countDocuments({ userId });

    const totalPages = Math.ceil(totalPulses / +limit);

    const pulses = await Pulse.find({ userId })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 })
      .populate(
        "userId",
        "_id firstName lastName username coverImage profilePicture"
      );

    return res.status(200).json({
      success: true,
      pulses,
      pagination: {
        page: +page,
        limit: +limit,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

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

    const savedPulse = await pulse.save();

    return res.status(201).json({
      success: true,
      savedPulse,
      message: "Your Pulse has been posted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const deletePulse = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const pulseId: string = req.params.pulseId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    if (!pulseId) {
      return res.status(400).json({
        success: false,
        message: "Pulse Id is required.",
      });
    }

    await Pulse.findByIdAndDelete(pulseId);

    return res.status(200).json({
      success: true,
      message: "Pulse deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
