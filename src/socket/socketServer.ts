import cookieParser from "cookie-parser";
import http from "http";
import { Server, Socket } from "socket.io";
import { corsOptions } from "../constants/options.js";
import { HUDDLE_TOKEN } from "../constants/variables.js";
import { Request, Response } from "express";
import EventEmitter from "events";
import jwt from "jsonwebtoken";
import { NEW_CHAT_REQUEST, SEND_MESSAGE } from "../constants/events.js";
import { newChatRequestHandler } from "./handlers/chatHandler.js";
import { sendMessageHandler } from "./handlers/messageHandler.js";

export const SocketEventEmitter = new EventEmitter();
export const ConnectedUsers = new Map<string, string>();

const socketServer = (
  httpServer: http.Server<
    typeof http.IncomingMessage,
    typeof http.ServerResponse
  >
) => {
  const io = new Server(httpServer, {
    cors: corsOptions,
    transports: ["websocket"],
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

      socket.user = { id: verify.id };
      next();
    });
  });

  io.on("connection", (socket: Socket) => {
    ConnectedUsers.set(socket.user.id, socket.id);

    socket.on("reconnect", () => {
      ConnectedUsers.set(socket.user.id, socket.id);
    });

    SocketEventEmitter.on(
      NEW_CHAT_REQUEST,
      ({ chatRequest }: { chatRequest: ChatRequest }) =>
        newChatRequestHandler(socket, chatRequest)
    );

    socket.on(
      SEND_MESSAGE,
      async ({ message, chat }: { message: Message; chat: Chat }) => {
        await sendMessageHandler(socket, message, chat);
      }
    );

    socket.on("disconnect", () => {
      ConnectedUsers.delete(socket.user.id);
    });
  });
};

export default socketServer;
