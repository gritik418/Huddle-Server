import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { sendJoinRequest } from "../controllers/joinRequestController.js";
const router = Router();
router.post("/:channelId", authenticate, sendJoinRequest);
export default router;
