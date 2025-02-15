import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getFollowing, getUser } from "../controllers/userController.js";

const router = Router();

router.get("/", authenticate, getUser);

router.get("/following", authenticate, getFollowing);

export default router;
