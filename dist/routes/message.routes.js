import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { deleteForMe, getMessages } from "../controllers/messageController.js";
const router = Router();
router.get("/:chatId", authenticate, getMessages);
router.delete("/:messageId/delete-for-me", authenticate, deleteForMe);
export default router;
