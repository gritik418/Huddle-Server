import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { corsOptions } from "./constants/options.js";
import connectDB from "./database/index.js";
import socketServer from "./socket/socketServer.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import postRoutes from "./routes/post.routes.js";
import groupRoutes from "./routes/group.routes.js";
import searchRoutes from "./routes/search.routes.js";
import messageRoutes from "./routes/message.routes.js";
import chatRequestRoutes from "./routes/chat-request.routes.js";
import followRequestRoutes from "./routes/follow-request.routes.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

connectDB();
socketServer(server);

app.use(express.static(path.join(__dirname, "../public")));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/post", postRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/chat-requests", chatRequestRoutes);
app.use("/api/follow-requests", followRequestRoutes);

server.listen(PORT, () => {
  console.log(`App served at: http://localhost:${PORT}`);
});
