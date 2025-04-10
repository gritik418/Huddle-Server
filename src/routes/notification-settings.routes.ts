import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getUserNotificationSettings } from "../controllers/notificationSettingsController.js";

const router = Router();

router.get("/", authenticate, getUserNotificationSettings);

export default router;
