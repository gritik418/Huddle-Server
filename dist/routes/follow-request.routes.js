import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getFollowRequests } from "../controllers/followRequestController.js";
const router = Router();
router.get("/", authenticate, getFollowRequests);
export default router;
