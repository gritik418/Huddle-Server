import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { corsOptions } from "../constants/options.js";
import { HUDDLE_TOKEN } from "../constants/variables.js";
import EventEmitter from "events";
import jwt from "jsonwebtoken";
import { SEND_MESSAGE, SOCKET_NEW_CHAT_REQUEST, } from "../constants/events.js";
import { newChatRequestHandler } from "./handlers/chatRequestHandler.js";
import { sendMessageHandler } from "./handlers/messageHandler.js";
import User from "../models/User.js";
export const SocketEventEmitter = new EventEmitter();
export const ConnectedUsers = new Map();
const socketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: corsOptions,
        transports: ["websocket"],
    });
    io.use((socket, next) => {
        const req = socket.request;
        const res = req.res;
        cookieParser()(req, res, async (err) => {
            if (err)
                return next(new Error("Failed to parse cookies"));
            const token = req.cookies[HUDDLE_TOKEN];
            if (!token)
                return next(new Error("Authentication failed!"));
            const verify = jwt.verify(token, process.env.JWT_SECRET);
            if (!verify || !verify.id)
                return res.status(401).json({
                    success: false,
                    message: "Authentication failed!",
                });
            const user = await User.findById(verify.id).select({
                _id: 1,
                firstName: 1,
                lastName: 1,
                username: 1,
                profilePicture: 1,
            });
            socket.user = {
                id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName || "",
                username: user.username,
                profilePicture: user.profilePicture || "",
            };
            next();
        });
    });
    io.on("connection", (socket) => {
        ConnectedUsers.set(socket.user.id, socket);
        socket.on("reconnect", () => {
            ConnectedUsers.set(socket.user.id, socket);
        });
        socket.on(SEND_MESSAGE, async ({ message, chat }) => {
            await sendMessageHandler(io, socket, message, chat);
        });
        SocketEventEmitter.on(SOCKET_NEW_CHAT_REQUEST, ({ chatRequest }) => {
            if (chatRequest.sender.toString() === socket.user.id) {
                newChatRequestHandler(io, socket, chatRequest);
            }
        });
        socket.on("disconnect", () => {
            ConnectedUsers.delete(socket.user.id);
        });
    });
};
export default socketServer;
