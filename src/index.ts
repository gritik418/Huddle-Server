import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { corsOptions } from "./constants/options.js";
import socketServer from "./socketServer.js";
import connectDB from "./database/index.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;

connectDB();
socketServer(server);

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/auth", authRoutes);

server.listen(PORT, () => {
  console.log(`App served at: http://localhost:${PORT}`);
});
