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
        cookieParser()(req, res, async (err) => {
            if (err)
                return next(new Error("Failed to parse cookies"));
            const token = req.cookies[HUDDLE_TOKEN];
            if (!token)
                return next(new Error("Authentication failed!"));
            socket.user = token;
            next();
        });
    });
    io.on("connection", (socket) => {
        console.log("connected", socket.id);
        socket.on("disconnect", () => {
            console.log("disconnected");
        });
    });
};
export default socketServer;
