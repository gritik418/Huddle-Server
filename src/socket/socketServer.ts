import cookieParser from "cookie-parser";
import http from "http";
import { Server, Socket } from "socket.io";
import { corsOptions } from "../constants/options.js";
import { HUDDLE_TOKEN } from "../constants/variables.js";
import { Request, Response } from "express";
import EventEmitter from "events";
import jwt from "jsonwebtoken";
import {
  SEND_CHANNEL_MESSAGE,
  SEND_MESSAGE,
  STATUS_UPDATE,
  USER_ONLINE,
} from "../constants/events.js";
import { sendMessageHandler } from "./handlers/messageHandler.js";
import User from "../models/User.js";
import { sendChannelMessageHandler } from "./handlers/channelMessageHandler.js";

export const SocketEventEmitter = new EventEmitter();
export const ConnectedUsers = new Map<string, Socket>();

const socketServer = (
  httpServer: http.Server<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  >
) => {
  const io = new Server(httpServer, {
    cors: corsOptions,
    transports: ["websocket"],
    allowEIO3: true,
    allowUpgrades: true,
    pingTimeout: 1000,
  });

  io.use((socket: Socket, next) => {
    const req = socket.request as Request;
    const res = req.res as Response;

    cookieParser()(req, res, async (err) => {
      if (err) return next(new Error("Failed to parse cookies"));

      const token = req.cookies[HUDDLE_TOKEN];
      if (!token) return next(new Error("Authentication failed!"));

      const verify: JWT_Payload = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as JWT_Payload;

      if (!verify || !verify.id)
        return res.status(401).json({
          success: false,
          message: "Authentication failed!",
        });

      const user: User = await User.findById(verify.id).select({
        _id: 1,
        firstName: 1,
        lastName: 1,
        username: 1,
        profilePicture: 1,
        chatMembers: 1,
        showActiveStatus: 1,
      });

      if (!user) return next(new Error("Authentication failed!"));

      socket.user = {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName || "",
        username: user.username,
        profilePicture: user.profilePicture || "",
        chatMembers: user.chatMembers || [],
        showActiveStatus: user.showActiveStatus,
      };
      next();
    });
  });

  io.on("connection", (socket: Socket) => {
    ConnectedUsers.set(socket.user.id, socket);

    socket.on(USER_ONLINE, async () => {
      if (socket.user.showActiveStatus) {
        await User.findByIdAndUpdate(socket.user.id, {
          $set: { isActive: true },
        });

        socket.user.chatMembers?.forEach((member: string) => {
          const receiver = ConnectedUsers.get(member.toString());
          if (receiver) {
            io.to(receiver.id).emit(STATUS_UPDATE, {
              userId: socket.user.id,
              status: "ONLINE",
            });
          }
        });
      } else {
        await User.findByIdAndUpdate(socket.user.id, {
          $set: { isActive: false },
        });
      }
    });

    socket.on("reconnect", () => {
      ConnectedUsers.set(socket.user.id, socket);
    });

    socket.on(
      SEND_MESSAGE,
      async ({ message, chat }: { message: Message; chat: Chat }) => {
        await sendMessageHandler(io, socket, message, chat);
      }
    );

    socket.on(SEND_CHANNEL_MESSAGE, async ({ content, channel }) => {
      await sendChannelMessageHandler(io, socket, channel, content);
    });

    socket.on("disconnect", async () => {
      ConnectedUsers.delete(socket.user.id);
      if (socket.user.showActiveStatus) {
        await User.findByIdAndUpdate(socket.user.id, {
          $set: { isActive: false },
        });

        socket.user.chatMembers?.forEach((member: string) => {
          const receiver = ConnectedUsers.get(member.toString());
          if (receiver) {
            io.to(receiver.id).emit(STATUS_UPDATE, {
              userId: socket.user.id,
              status: "OFFLINE",
            });
          }
        });
      } else {
        await User.findByIdAndUpdate(socket.user.id, {
          $set: { isActive: false },
        });
      }
    });
  });
};

export default socketServer;
