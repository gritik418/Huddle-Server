import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  createChannel,
  deleteChannel,
  getAllChannels,
  getChannelById,
  getChannelChats,
  getChannelMessages,
  getCreatedChannels,
  getJoinedChannels,
  getUserChannels,
  leaveChannel,
  removeMemberFromChannel,
} from "../controllers/channelController.js";

const router = Router();

router.post("/", authenticate, createChannel);

router.get("/", authenticate, getAllChannels);

router.get("/me", authenticate, getUserChannels);

router.get("/joined", authenticate, getJoinedChannels);

router.get("/created", authenticate, getCreatedChannels);

router.get("/chats", authenticate, getChannelChats);

router.get("/:channelId", authenticate, getChannelById);

router.delete("/:channelId", authenticate, deleteChannel);

router.get("/:channelId/messages", authenticate, getChannelMessages);

router.delete(
  "/:channelId/remove/:memberId",
  authenticate,
  removeMemberFromChannel
);

router.delete("/:channelId/leave", authenticate, leaveChannel);

export default router;
