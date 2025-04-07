import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { inviteMemberToChannel } from "../controllers/channelInviteController.js";

const router = Router();

router.post(
  "/:channelId/invite/:receiverId",
  authenticate,
  inviteMemberToChannel
);

export default router;
