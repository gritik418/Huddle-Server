import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getAllInvites, inviteMemberToChannel, } from "../controllers/channelInviteController.js";
const router = Router();
router.post("/:channelId/invite/:receiverId", authenticate, inviteMemberToChannel);
router.get("/", authenticate, getAllInvites);
export default router;
