import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { corsOptions } from "./constants/options.js";
import connectDB from "./database/index.js";
import socketServer from "./socketServer.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import chatRequestRoutes from "./routes/chat-request.routes.js";

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
app.use("/api/chat-requests", chatRequestRoutes);

server.listen(PORT, () => {
  console.log(`App served at: http://localhost:${PORT}`);
});
