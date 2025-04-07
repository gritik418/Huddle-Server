import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  acceptChannelInvite,
  getAllInvites,
  inviteMemberToChannel,
} from "../controllers/channelInviteController.js";

const router = Router();

router.post(
  "/:channelId/invite/:receiverId",
  authenticate,
  inviteMemberToChannel
);

router.get("/", authenticate, getAllInvites);

router.post("/:inviteId/accept", authenticate, acceptChannelInvite);

export default router;
