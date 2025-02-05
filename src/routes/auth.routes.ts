import { Router } from "express";
import {
  userLogin,
  userSignup,
  verifyEmail,
} from "../controllers/authControllers.js";

const router = Router();

router.post("/signup", userSignup);

router.post("/login", userLogin);

router.post("/verify-email", verifyEmail);

export default router;
