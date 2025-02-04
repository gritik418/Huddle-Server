import { Router } from "express";
import { userLogin, userSignup } from "../controllers/authControllers.js";

const router = Router();

router.post("/signup", userSignup);

router.post("/login", userLogin);

export default router;
