import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { createChannel, getUserChannels, } from "../controllers/channelController.js";
const router = Router();
router.post("/", authenticate, createChannel);
router.get("/me", authenticate, getUserChannels);
export default router;
