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

export const getAllInvites = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const invites = await ChannelInvite.find({
      receiverId: userId,
      status: "pending",
    })
      .populate(
        "senderId",
        "_id firstName lastName username profilePicture coverImage"
      )
      .populate(
        "receiverId",
        "_id firstName lastName username profilePicture coverImage"
      )
      .populate("channelId", "name description members type creatorId");

    return res.status(200).json({
      success: true,
      invites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const acceptChannelInvite = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const inviteId: string = req.params.inviteId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    if (!inviteId) {
      return res.status(400).json({
        success: false,
        message: "Invite id is required.",
      });
    }

    const invite: ChannelInvite | null = await ChannelInvite.findById(inviteId);

    if (!invite || invite.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Invite expired.",
      });
    }

    if (invite.receiverId.toString() !== userId) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to accept this invite.",
      });
    }

    const channel: Channel | null = await Channel.findById(invite.channelId);
    if (!channel)
      return res.status(400).json({
        success: false,
        message: "Channel not found.",
      });

    const memberIds: string[] = channel.members.map((id: string) =>
      id.toString()
    );

    if (memberIds.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this channel.",
      });
    }

    await Channel.findByIdAndUpdate(channel._id, {
      $push: { members: userId },
    });

    await ChannelInvite.findByIdAndDelete(inviteId);

    return res.status(200).json({
      success: true,
      message: "You have joined the channel.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const declineChannelInvite = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const inviteId: string = req.params.inviteId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    if (!inviteId) {
      return res.status(400).json({
        success: false,
        message: "Invite id is required.",
      });
    }

    const invite: ChannelInvite | null = await ChannelInvite.findById(inviteId);

    if (!invite || invite.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Invite expired.",
      });
    }

    if (invite.receiverId.toString() !== userId) {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to decline this invite.",
      });
    }

    const channel: Channel | null = await Channel.findById(invite.channelId);
    if (!channel)
      return res.status(400).json({
        success: false,
        message: "Channel not found.",
      });

    const memberIds: string[] = channel.members.map((id: string) =>
      id.toString()
    );

    if (memberIds.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are a member of this channel.",
      });
    }

    await ChannelInvite.findByIdAndDelete(inviteId);

    return res.status(200).json({
      success: true,
      message: "You have declined the invite.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
