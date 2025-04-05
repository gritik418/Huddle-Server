import { Request, Response } from "express";
import Channel from "../models/Channel.js";
import JoinRequest from "../models/JoinRequest.js";

export const sendJoinRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const channelId: string = req.params.channelId;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    if (!channelId)
      return res.status(400).json({
        success: false,
        message: "Channel Id is required.",
      });

    const channel: Channel | null = await Channel.findById(channelId);
    if (!channel)
      return res.status(400).json({
        success: false,
        message: "Channel not found.",
      });

    if (channel.creatorId.toString() === userId) {
      return res.status(200).json({
        success: true,
        message: "You’re the creator of this channel.",
      });
    }

    const memberIds: string[] = channel.members.map((id: string) =>
      id.toString()
    );

    if (memberIds.includes(userId)) {
      return res.status(200).json({
        success: true,
        message: "You’re already a member of this channel.",
      });
    }

    const existingRequest = await JoinRequest.findOne({
      channelId,
      userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(200).json({
        success: true,
        message: "You already sent a join request.",
      });
    }

    const joinRequest = new JoinRequest({
      channelId,
      userId,
      status: "pending",
    });

    await joinRequest.save();

    return res.status(200).json({
      success: true,
      message: "Join request has been sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
