import { Request, Response } from "express";
import Channel from "../models/Channel.js";
import ChannelInvite from "../models/ChannelInvite.js";

export const inviteMemberToChannel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const channelId: string = req.params.channelId;
    const receiverId: string = req.params.receiverId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "Channel Id is required.",
      });
    }

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver Id is required.",
      });
    }

    const channel: Channel | null = await Channel.findById(channelId);

    if (!channel) {
      return res.status(400).json({
        success: false,
        message: "Channel not found.",
      });
    }

    if (channel.creatorId.toString() !== userId) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to invite any member.",
      });
    }

    const memberIds = channel.members.map((memberId: string) =>
      memberId.toString()
    );

    if (memberIds.includes(receiverId)) {
      return res.status(401).json({
        success: false,
        message: "User is already a member of this channel.",
      });
    }

    const channelInvite = new ChannelInvite({
      channelId,
      receiverId,
      senderId: userId,
      status: "pending",
    });

    await channelInvite.save();

    return res.status(200).json({
      success: true,
      message: "Invite sent successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
