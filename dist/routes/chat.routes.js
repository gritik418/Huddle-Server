import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getChats } from "../controllers/chatController.js";
const router = Router();
router.get("/", authenticate, getChats);
export default router;
