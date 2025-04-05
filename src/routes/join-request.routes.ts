import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  getJoinRequests,
  sendJoinRequest,
} from "../controllers/joinRequestController.js";

const router = Router();

router.post("/:channelId", authenticate, sendJoinRequest);

router.get("/:channelId", authenticate, getJoinRequests);

export default router;
