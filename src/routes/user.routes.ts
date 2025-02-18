import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  getActiveMembers,
  getFollowers,
  getFollowing,
  getUser,
  getUserByUsername,
} from "../controllers/userController.js";

const router = Router();

router.get("/", authenticate, getUser);

router.get("/following", authenticate, getFollowing);

router.get("/followers", authenticate, getFollowers);

router.get("/active", authenticate, getActiveMembers);

router.get("/:username", authenticate, getUserByUsername);

export default router;
