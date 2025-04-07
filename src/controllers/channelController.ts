import { Request, Response } from "express";
import ChannelSchema, { ChannelData } from "../validators/channelSchema.js";
import Channel from "../models/Channel.js";
import ChannelMessage from "../models/ChannelMessage.js";
import JoinRequest from "../models/JoinRequest.js";

export const getAllChannels = async (
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

    const channels = await Channel.find();

    return res.status(200).json({
      success: true,
      channels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const createChannel = async (
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

    const data: ChannelData = req.body;

    const result = ChannelSchema.safeParse(data);
    if (!result.success) {
      const errors: { [name: string]: string } = {};
      result.error.errors.forEach((error) => {
        errors[error.path[0]] = error.message;
      });

      return res.status(400).json({
        success: false,
        message: "Validation Error.",
        errors,
      });
    }

    const { name, description, sendMessagePermission, type } = result.data;

    const existingChannel = await Channel.findOne({ name, creatorId: userId });
    if (existingChannel) {
      return res.status(400).json({
        success: false,
        message: `A channel named "${name}" already exists. Please choose another name.`,
      });
    }

    const channel = new Channel({
      name,
      description,
      sendMessagePermission,
      type,
      members: [userId],
      creatorId: userId,
      isActive: true,
    });

    const savedChannel = await channel.save();

    return res.status(201).json({
      success: true,
      message: "Channel has been successfully created.",
      channel: savedChannel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getUserChannels = async (
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

    const channels = await Channel.find({ creatorId: userId });

    return res.status(200).json({
      success: true,
      channels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getChannelById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const channelId: string = req.params.channelId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });
    }

    const channel = await Channel.findById(channelId)
      .populate(
        "members",
        "_id firstName lastName username profilePicture coverImage"
      )
      .populate(
        "creatorId",
        "_id firstName lastName username profilePicture coverImage"
      );

    if (!channel) {
      return res.status(400).json({
        success: false,
        message: "Channel not found.",
      });
    }

    return res.status(200).json({
      success: true,
      channel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getJoinedChannels = async (
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
    const totalChannels = await Channel.countDocuments({
      members: { $in: userId },
    });

    const totalPages = Math.ceil(totalChannels / +limit);

    const channels = await Channel.find({
      members: { $in: userId },
    })
      .populate(
        "members",
        "_id firstName lastName username profilePicture coverImage"
      )
      .populate(
        "creatorId",
        "_id firstName lastName username profilePicture coverImage"
      )
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    if (!channels || channels.length === 0) {
      return res.status(400).json({
        success: false,
        message: "You haven't joined any channels yet.",
      });
    }

    return res.status(200).json({
      success: true,
      channels,
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

export const getCreatedChannels = async (
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

    const totalChannels = await Channel.countDocuments({
      creatorId: userId,
    });

    const totalPages = Math.ceil(totalChannels / +limit);

    const channels = await Channel.find({
      creatorId: userId,
    })
      .populate(
        "members",
        "_id firstName lastName username profilePicture coverImage"
      )
      .populate(
        "creatorId",
        "_id firstName lastName username profilePicture coverImage"
      )
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    if (!channels || channels.length === 0) {
      return res.status(400).json({
        success: false,
        message: "You haven't created any channels yet.",
      });
    }

    return res.status(200).json({
      success: true,
      channels,
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

export const getChannelChats = async (
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

    const channels = await Channel.find({
      members: { $in: userId },
    })
      .populate(
        "members",
        "_id firstName lastName username profilePicture coverImage"
      )
      .populate(
        "creatorId",
        "_id firstName lastName username profilePicture coverImage"
      )
      .sort({ createdAt: -1 });

    if (!channels || channels.length === 0) {
      return res.status(400).json({
        success: false,
        message: "You haven't joined any channels yet.",
      });
    }

    return res.status(200).json({
      success: true,
      channels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getChannelMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const channelId: string = req.params.channelId;

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

    const messages = await ChannelMessage.find({
      channelId,
    })
      .populate(
        "sender",
        "_id firstName lastName username profilePicture coverImage"
      )
      .sort({ createdAt: -1 });

    if (!messages || messages.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No messages yet.",
      });
    }

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

export const deleteChannel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const channelId: string = req.params.channelId;

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
        message: "You are not authorized to delete this channel.",
      });
    }

    await Channel.findByIdAndDelete(channelId);
    await ChannelMessage.deleteMany({ channelId });
    await JoinRequest.deleteMany({ channelId });

    return res.status(200).json({
      success: true,
      message: "Channel deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const removeMemberFromChannel = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const channelId: string = req.params.channelId;
    const memberId: string = req.params.memberId;

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

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: "Member Id is required.",
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
        message: "You are not authorized to remove any member.",
      });
    }

    const memberIds = channel.members.map((memberId: string) =>
      memberId.toString()
    );

    if (!memberIds.includes(memberId)) {
      return res.status(401).json({
        success: false,
        message: "User is not a member of this channel.",
      });
    }

    await Channel.findByIdAndUpdate(channelId, {
      $pull: { members: memberId },
    });

    await ChannelMessage.deleteMany({
      channelId,
      sender: memberId,
    });

    return res.status(200).json({
      success: true,
      message: "Member removed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
