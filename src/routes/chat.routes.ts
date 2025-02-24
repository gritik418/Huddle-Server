import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getChatById, getChats } from "../controllers/chatController.js";

const router = Router();

router.get("/", authenticate, getChats);

router.get("/:chatId", authenticate, getChatById);

export default router;
