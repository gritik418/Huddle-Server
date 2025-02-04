import cookieParser from "cookie-parser";
import http from "http";
import { Server, Socket } from "socket.io";
import { corsOptions } from "./constants/options.js";
import { HUDDLE_TOKEN } from "./constants/variables.js";
import { Request, Response } from "express";

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

      socket.user = token;
      next();
    });
  });

  io.on("connection", (socket: Socket) => {
    console.log("connected", socket.id);
    socket.on("disconnect", () => {
      console.log("disconnected");
    });
  });
};

export default socketServer;
