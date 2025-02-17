import { Request, Response } from "express";
import FollowRequest from "../models/FollowRequest.js";
import User from "../models/User.js";
import { ConnectedUsers } from "../socket/socketServer.js";
import { Socket } from "socket.io";
import { NEW_FOLLOW_REQUEST } from "../constants/events.js";

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

export const sendFollowRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const receiverId: string = req.params.receiverId;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    if (!receiverId)
      return res.status(400).json({
        success: false,
        message: "Receiver Id is required.",
      });

    const receiver: User | null = await User.findById(receiverId);
    if (!receiver)
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });

    const existingRequest = await FollowRequest.findOne({
      sender: userId,
      receiver: receiverId,
      status: "pending",
    });
    if (existingRequest)
      return res.status(400).json({
        success: false,
        message: "You already have a pending follow request with this user.",
      });

    const request = new FollowRequest({
      sender: userId,
      receiver: receiverId,
      status: "pending",
    });

    const savedRequest = await request.save();

    const receiverSocket: Socket | undefined = ConnectedUsers.get(
      receiver._id.toString()
    );
    if (receiverSocket && receiverSocket.id) {
      const user: User | null = await User.findById(userId);

      const modifiedRequest = {
        receiver: savedRequest.receiver,
        status: savedRequest.status,
        _id: savedRequest._id,
        sender: {
          _id: user?._id.toString(),
          firstName: user?.firstName,
          lastName: user?.lastName,
          username: user?.username,
          profilePicture: user?.profilePicture,
        },
      };

      receiverSocket.emit(NEW_FOLLOW_REQUEST, {
        followRequest: modifiedRequest,
      });
    }

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
