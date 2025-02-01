import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import { corsOptions } from "./constants/options.js";
import socketServer from "./socketServer.js";
const app = express();
const server = http.createServer(app);
const port = process.env.PORT;
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
socketServer(server);
server.listen(port, () => {
    console.log(`App served at: http://localhost:${port}`);
});
