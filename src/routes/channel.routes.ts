import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  createChannel,
  getAllChannels,
  getChannelById,
  getCreatedChannels,
  getJoinedChannels,
  getUserChannels,
} from "../controllers/channelController.js";

const router = Router();

router.post("/", authenticate, createChannel);

router.get("/", authenticate, getAllChannels);

router.get("/me", authenticate, getUserChannels);

router.get("/joined", authenticate, getJoinedChannels);

router.get("/created", authenticate, getCreatedChannels);

router.get("/:channelId", authenticate, getChannelById);

export default router;
