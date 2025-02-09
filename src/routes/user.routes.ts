import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getUser } from "../controllers/userController.js";

const router = Router();

router.get("/", authenticate, getUser);

export default router;
