import { Request, Response } from "express";
import groupSchema, { GroupData } from "../validators/groupSchema.js";
import Chat from "../models/Chat.js";
import { Socket } from "socket.io";
import { ConnectedUsers } from "../socket/socketServer.js";
import { ADDED_TO_GROUP } from "../constants/events.js";
import User from "../models/User.js";

export const getGroupById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const groupId: string = req.params.groupId;

    const group: Chat | null = await Chat.findById(groupId)
      .populate("members", "_id firstName lastName username profilePicture")
      .populate("admins", "_id firstName lastName username profilePicture");

    if (!group || group.deletedFor.includes(userId))
      return res.status(400).json({
        success: false,
        message: "Group doesn't exists.",
      });

    return res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const createGroup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const data: GroupData = req.body;
    const userId: string = req.params.userId;
    const result = groupSchema.safeParse(data);

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
    const { groupName, groupDescription, admins, members } = result.data;

    const newGroup = new Chat({
      isGroupChat: true,
      groupName,
      groupDescription,
      members: [...members, userId],
      admins: [...admins, userId],
      groupStatus: "active",
    });

    const savedGroup = await newGroup.save();
    const user: User | null = await User.findById(userId);

    members.forEach((member: string) => {
      const receiverSocket: Socket | undefined = ConnectedUsers.get(member);

      if (receiverSocket && receiverSocket?.id) {
        receiverSocket.emit(ADDED_TO_GROUP, {
          chat: savedGroup,
          creator: {
            _id: user?._id,
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username,
            profilePicture: user?.profilePicture,
          },
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Group created.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const deleteGroup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const groupId: string = req.params.groupId;

    const group: Chat | null = await Chat.findById(groupId);

    if (!group)
      return res.status(400).json({
        success: false,
        message: "Group doesn't exists.",
      });

    const isAdmin: boolean = group.admins?.find(
      (admin: string) => admin.toString() === userId
    );

    if (!isAdmin)
      return res.status(401).json({
        success: false,
        message: "Only Group Admin can delete the group.",
      });

    if (group.groupStatus === "deleted") {
      return res.status(400).json({
        success: false,
        message: "Group has already been deleted.",
      });
    }

    await Chat.findByIdAndUpdate(groupId, {
      $set: {
        deletedAt: Date.now(),
        deletedBy: userId,
        groupStatus: "deleted",
      },
      $push: { deletedFor: userId },
    });

    return res.status(200).json({
      success: true,
      message: "Group deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
