import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  getFollowRequests,
  sendFollowRequest,
} from "../controllers/followRequestController.js";

const router = Router();

router.get("/", authenticate, getFollowRequests);

router.post("/:receiverId", authenticate, sendFollowRequest);

export default router;
