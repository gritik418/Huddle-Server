import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import { createGroup, getGroupById } from "../controllers/groupController";

const router = Router();

router.post("/", authenticate, createGroup);

router.get("/:groupId", authenticate, getGroupById);

export default router;
