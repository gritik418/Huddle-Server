import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { corsOptions } from "./constants/options.js";
import connectDB from "./database/index.js";
import socketServer from "./socket/socketServer.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import postRoutes from "./routes/post.routes.js";
import pulseRoutes from "./routes/pulse.routes.js";
import groupRoutes from "./routes/group.routes.js";
import searchRoutes from "./routes/search.routes.js";
import channelRoutes from "./routes/channel.routes.js";
import messageRoutes from "./routes/message.routes.js";
import chatRequestRoutes from "./routes/chat-request.routes.js";
import followRequestRoutes from "./routes/follow-request.routes.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const staticPath = path.resolve(__dirname, "../public");

connectDB();
socketServer(server);

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.static(staticPath));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/post", postRoutes);
app.use("/api/pulse", pulseRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/chat-requests", chatRequestRoutes);
app.use("/api/follow-requests", followRequestRoutes);

server.listen(PORT, () => {
  console.log(`App served at: http://localhost:${PORT}`);
});
