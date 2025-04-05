import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { acceptJoinRequest, declineJoinRequest, getJoinRequests, sendJoinRequest, } from "../controllers/joinRequestController.js";
const router = Router();
router.post("/:channelId", authenticate, sendJoinRequest);
router.get("/:channelId", authenticate, getJoinRequests);
router.post("/:requestId/accept", authenticate, acceptJoinRequest);
router.post("/:requestId/decline", authenticate, declineJoinRequest);
export default router;
