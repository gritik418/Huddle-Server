import { Router } from "express";
import {
  acceptChatRequest,
  declineChatRequest,
  getChatRequests,
  searchUsers,
  sendChatRequest,
} from "../controllers/chatRequestController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.get("/", authenticate, getChatRequests);

router.get("/search", authenticate, searchUsers);

router.post("/", authenticate, sendChatRequest);

router.put("/:requestId/accept", authenticate, acceptChatRequest);

router.put("/:requestId/decline", authenticate, declineChatRequest);

export default router;
