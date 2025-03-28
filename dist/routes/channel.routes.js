import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { createChannel } from "../controllers/channelController.js";
const router = Router();
router.post("/", authenticate, createChannel);
export default router;
