import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import { addPulse, deletePulse, getAllPulses, getUserPulses, } from "../controllers/pulseController.js";
const router = Router();
router.get("/", authenticate, getAllPulses);
router.get("/me", authenticate, getUserPulses);
router.post("/", authenticate, addPulse);
router.delete("/:pulseId", authenticate, deletePulse);
export default router;
