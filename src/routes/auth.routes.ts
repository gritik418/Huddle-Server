import { Router } from "express";
import {
  deactivateAccount,
  userLogin,
  userLogout,
  userSignup,
  verifyEmail,
} from "../controllers/authController.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.post("/signup", userSignup);

router.post("/login", userLogin);

router.post("/verify-email", verifyEmail);

router.post("/logout", authenticate, userLogout);

router.patch("/deactivate", authenticate, deactivateAccount);

export default router;
