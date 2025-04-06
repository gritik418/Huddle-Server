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

    if (channel.type === "public") {
      await Channel.findByIdAndUpdate(channel._id, {
        $push: { members: userId },
      });

      return res.status(200).json({
        success: true,
        message: "Successfully joined the channel.",
      });
    }

    if (channel.type === "invite-only") {
      return res.status(400).json({
        success: false,
        message:
          "This is an invite-only channel. You cannot join without an invite.",
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

export const getJoinRequests = async (
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

    const joinRequests = await JoinRequest.find({
      channelId,
      status: "pending",
    }).populate(
      "userId",
      "_id firstName lastName username profilePicture coverImage"
    );

    return res.status(200).json({
      success: true,
      joinRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const acceptJoinRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const requestId: string = req.params.requestId;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    if (!requestId)
      return res.status(400).json({
        success: false,
        message: "Request Id is required.",
      });

    const joinRequest: JoinRequest | null = await JoinRequest.findById(
      requestId
    );

    if (!joinRequest)
      return res.status(400).json({
        success: false,
        message: "Join request does not exist or may have been removed.",
      });

    const channel: Channel | null = await Channel.findById(
      joinRequest.channelId
    );
    if (!channel)
      return res.status(400).json({
        success: false,
        message: "Channel not found.",
      });

    if (channel.creatorId.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "You’re not authorized to manage this channel.",
      });
    }

    const memberIds: string[] = channel.members.map((id: string) =>
      id.toString()
    );

    if (memberIds.includes(joinRequest.userId.toString())) {
      return res.status(200).json({
        success: true,
        message: "User is already a member of this channel.",
      });
    }

    await Channel.findByIdAndUpdate(channel._id, {
      $push: { members: joinRequest.userId },
    });

    await JoinRequest.findByIdAndDelete(requestId);

    return res.status(200).json({
      success: true,
      message: "Join request accepted. User has been added to the channel.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const declineJoinRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const requestId: string = req.params.requestId;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    if (!requestId)
      return res.status(400).json({
        success: false,
        message: "Request Id is required.",
      });

    const joinRequest: JoinRequest | null = await JoinRequest.findById(
      requestId
    );

    if (!joinRequest)
      return res.status(400).json({
        success: false,
        message: "Join request does not exist or may have been removed.",
      });

    const channel: Channel | null = await Channel.findById(
      joinRequest.channelId
    );
    if (!channel)
      return res.status(400).json({
        success: false,
        message: "Channel not found.",
      });

    if (channel.creatorId.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "You’re not authorized to manage this channel.",
      });
    }

    const memberIds: string[] = channel.members.map((id: string) =>
      id.toString()
    );

    if (memberIds.includes(joinRequest.userId.toString())) {
      return res.status(200).json({
        success: true,
        message: "User is already a member of this channel.",
      });
    }
    await JoinRequest.findByIdAndDelete(requestId);

    return res.status(200).json({
      success: true,
      message: "Join request declined.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
