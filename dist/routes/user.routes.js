import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getActiveMembers, getFollowers, getFollowing, getUser, } from "../controllers/userController.js";
const router = Router();
router.get("/", authenticate, getUser);
router.get("/following", authenticate, getFollowing);
router.get("/followers", authenticate, getFollowers);
router.get("/active", authenticate, getActiveMembers);
export default router;
