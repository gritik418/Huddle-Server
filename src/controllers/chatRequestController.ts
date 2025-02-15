import { Request, Response } from "express";
import { NEW_CHAT, NEW_CHAT_REQUEST } from "../constants/events.js";
import Chat from "../models/Chat.js";
import ChatRequest from "../models/ChatRequest.js";
import User from "../models/User.js";
import { ConnectedUsers } from "../socket/socketServer.js";
import { Socket } from "socket.io";

export const searchUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const searchQuery = req.query["q"]?.toString();

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Please Login.",
      });

    if (!searchQuery || searchQuery.length < 3)
      return res.status(200).json({
        success: true,
        message: "Please enter at least 3 characters to start your search.",
      });

    const chats: Chat[] = await Chat.find({
      isGroupChat: false,
      members: { $in: [userId] },
    });

    const alreadyAdded: string[] = chats.map((chat: Chat) => {
      return chat.members
        .map((member) => member.toString())
        .find((member) => member !== userId);
    });

    const users = await User.find({
      _id: { $nin: [...alreadyAdded, userId] },
      $or: [
        {
          email: { $regex: searchQuery, $options: "i" },
        },
        {
          username: { $regex: searchQuery, $options: "i" },
        },
        {
          firstName: { $regex: searchQuery, $options: "i" },
        },
      ],
      isVerified: true,
    }).select({
      _id: 1,
      username: 1,
      profilePicture: 1,
      firstName: 1,
      lastName: 1,
    });

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message: "We couldn't find any matching users.",
      });
    }

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const getChatRequests = async (
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

    const chatRequests: ChatRequest[] = await ChatRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "_id firstName lastName username profilePicture");

    if (chatRequests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No chat requests at the moment.",
      });
    }

    return res.status(200).json({
      success: true,
      requests: chatRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const sendChatRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId: string = req.params.userId;
    const { receiverId } = req.body;

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

    const existingChat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [userId, receiverId] },
    });

    if (existingChat)
      return res.status(400).json({
        success: false,
        message: "Chat already exists between you and this user.",
      });

    const existingRequest = await ChatRequest.findOne({
      sender: userId,
      receiver: receiverId,
      status: "pending",
    });
    if (existingRequest)
      return res.status(400).json({
        success: false,
        message: "You already have a pending chat request with this user.",
      });

    const chatRequest = new ChatRequest({
      receiver: receiverId,
      sender: userId,
      status: "pending",
    });
    const savedChatRequest = await chatRequest.save();

    const receiverSocket: Socket | undefined = ConnectedUsers.get(
      receiver._id.toString()
    );
    if (receiverSocket && receiverSocket?.id) {
      const user: User | null = await User.findById(userId);

      const modifiedChatRequest = {
        receiver: savedChatRequest.receiver,
        status: savedChatRequest.status,
        _id: savedChatRequest._id,
        sender: {
          _id: user?._id.toString(),
          firstName: user?.firstName,
          lastName: user?.lastName,
          username: user?.username,
          profilePicture: user?.profilePicture,
        },
      };

      receiverSocket.emit(NEW_CHAT_REQUEST, {
        chatRequest: modifiedChatRequest,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat request sent.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const acceptChatRequest = async (
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

    const chatRequest: ChatRequest | null = await ChatRequest.findById(
      requestId
    );
    if (!chatRequest)
      return res.status(400).json({
        success: false,
        message: "Chat request not found.",
      });

    if (chatRequest.receiver.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "You are not the intended recipient of this request.",
      });
    }

    const existingChat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [userId, chatRequest.sender] },
    });
    if (existingChat) {
      await ChatRequest.findByIdAndDelete(requestId);
      return res.status(400).json({
        success: false,
        message: "Chat already exists between you and this user.",
      });
    }

    await ChatRequest.findByIdAndUpdate(requestId, {
      $set: { status: "accepted" },
    });

    const chat = new Chat({
      isGroupChat: false,
      members: [userId, chatRequest.sender],
    });

    const savedChat = await (
      await chat.save()
    ).populate("members", "_id firstName lastName username profilePicture");

    savedChat.members.forEach((member: { _id: string }) => {
      const receiverSocket: Socket | undefined = ConnectedUsers.get(
        member._id.toString()
      );

      if (receiverSocket && receiverSocket?.id) {
        receiverSocket.emit(NEW_CHAT, {
          chat: savedChat,
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Chat request accepted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const declineChatRequest = async (
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

    const chatRequest: ChatRequest | null = await ChatRequest.findById(
      requestId
    );
    if (!chatRequest)
      return res.status(400).json({
        success: false,
        message: "Chat request not found.",
      });

    if (chatRequest.receiver.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "You are not the intended recipient of this request.",
      });
    }

    const existingChat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [userId, chatRequest.sender] },
    });
    if (existingChat) {
      await ChatRequest.findByIdAndDelete(requestId);
      return res.status(400).json({
        success: false,
        message: "Chat already exists between you and this user.",
      });
    }

    await ChatRequest.findByIdAndUpdate(requestId, {
      $set: { status: "rejected" },
    });

    return res.status(200).json({
      success: true,
      message: "Chat request rejected.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
