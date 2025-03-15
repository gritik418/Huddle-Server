import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { addPulse } from "../controllers/pulseController.js";

const router = Router();

router.post("/", authenticate, addPulse);

export default router;
