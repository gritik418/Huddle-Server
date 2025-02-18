import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  acceptFollowRequest,
  getFollowRequests,
  sendFollowRequest,
} from "../controllers/followRequestController.js";

const router = Router();

router.get("/", authenticate, getFollowRequests);

router.post("/:receiverId", authenticate, sendFollowRequest);

router.put("/:requestId/accept", authenticate, acceptFollowRequest);

export default router;
