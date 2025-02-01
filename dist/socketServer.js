var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { corsOptions } from "./constants/options.js";
import { HUDDLE_TOKEN } from "./constants/variables.js";
const socketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: corsOptions,
        transports: ["websocket"],
    });
    io.use((socket, next) => {
        const req = socket.request;
        const res = req.res;
        cookieParser()(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                return next(new Error("Failed to parse cookies"));
            const token = req.cookies[HUDDLE_TOKEN];
            if (!token)
                return next(new Error("Authentication failed!"));
            socket.user = token;
            next();
        }));
    });
    io.on("connection", (socket) => {
        console.log("connected", socket.id);
        socket.on("disconnect", () => {
            console.log("disconnected");
        });
    });
};
export default socketServer;
