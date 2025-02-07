import { Router } from "express";
import {
  searchUsers,
  sendChatRequest,
} from "../controllers/chatRequestController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.get("/search", authenticate, searchUsers);

router.post("/", authenticate, sendChatRequest);

router.put("/:requestId/accept");

router.put("/:requestId/decline");

export default router;
