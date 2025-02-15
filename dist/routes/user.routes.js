import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getFollowers, getFollowing, getUser, } from "../controllers/userController.js";
const router = Router();
router.get("/", authenticate, getUser);
router.get("/following", authenticate, getFollowing);
router.get("/followers", authenticate, getFollowers);
export default router;
