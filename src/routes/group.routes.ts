import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  createGroup,
  deleteGroup,
  getGroupById,
  leaveGroup,
} from "../controllers/groupController.js";

const router = Router();

router.get("/:groupId", authenticate, getGroupById);

router.post("/", authenticate, createGroup);

router.delete("/:groupId", authenticate, deleteGroup);

router.put("/leave/:groupId", authenticate, leaveGroup);

export default router;
