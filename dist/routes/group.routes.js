import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { createGroup, getGroupById } from "../controllers/groupController.js";
const router = Router();
router.post("/", authenticate, createGroup);
router.get("/:groupId", authenticate, getGroupById);
export default router;
