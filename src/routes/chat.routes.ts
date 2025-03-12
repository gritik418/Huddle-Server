import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  clearChat,
  getChatById,
  getChats,
} from "../controllers/chatController.js";

const router = Router();

router.get("/", authenticate, getChats);

router.get("/:chatId", authenticate, getChatById);

router.delete("/:chatId/clear", authenticate, clearChat);

export default router;
