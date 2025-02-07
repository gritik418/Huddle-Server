import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getMessages } from "../controllers/messageController.js";
const router = Router();
router.get("/:chatId", authenticate, getMessages);
export default router;
