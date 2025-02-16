import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { corsOptions } from "../constants/options.js";
import { HUDDLE_TOKEN } from "../constants/variables.js";
import EventEmitter from "events";
import jwt from "jsonwebtoken";
import { SEND_MESSAGE, STATUS_UPDATE, USER_ONLINE, } from "../constants/events.js";
import { sendMessageHandler } from "./handlers/messageHandler.js";
import User from "../models/User.js";
export const SocketEventEmitter = new EventEmitter();
export const ConnectedUsers = new Map();
const socketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: corsOptions,
        transports: ["websocket"],
        allowEIO3: true,
        allowUpgrades: true,
        pingTimeout: 1000,
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
                chatMembers: 1,
            });
            socket.user = {
                id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName || "",
                username: user.username,
                profilePicture: user.profilePicture || "",
                chatMembers: user.chatMembers || [],
            };
            next();
        });
    });
    io.on("connection", (socket) => {
        ConnectedUsers.set(socket.user.id, socket);
        socket.on(USER_ONLINE, async () => {
            await User.findByIdAndUpdate(socket.user.id, {
                $set: { isActive: true },
            });
            socket.user.chatMembers?.forEach((member) => {
                const receiver = ConnectedUsers.get(member.toString());
                if (receiver) {
                    io.to(receiver.id).emit(STATUS_UPDATE, {
                        userId: socket.user.id,
                        status: "ONLINE",
                    });
                }
            });
        });
        socket.on("reconnect", () => {
            ConnectedUsers.set(socket.user.id, socket);
        });
        socket.on(SEND_MESSAGE, async ({ message, chat }) => {
            await sendMessageHandler(io, socket, message, chat);
        });
        socket.on("disconnect", async () => {
            ConnectedUsers.delete(socket.user.id);
            await User.findByIdAndUpdate(socket.user.id, {
                $set: { isActive: false },
            });
            socket.user.chatMembers?.forEach((member) => {
                const receiver = ConnectedUsers.get(member.toString());
                if (receiver) {
                    io.to(receiver.id).emit(STATUS_UPDATE, {
                        userId: socket.user.id,
                        status: "OFFLINE",
                    });
                }
            });
        });
    });
};
export default socketServer;
