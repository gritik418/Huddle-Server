import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { getUserNotificationSettings, updateSingleNotificationSetting, } from "../controllers/notificationSettingsController.js";
const router = Router();
router.get("/", authenticate, getUserNotificationSettings);
router.put("/:settingKey", authenticate, updateSingleNotificationSetting);
export default router;
