import { Router } from "express";
import { userSignup } from "../controllers/authControllers.js";

const router = Router();

router.post("/signup", userSignup);

export default router;
