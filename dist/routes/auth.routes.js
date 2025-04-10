import { Router } from "express";
import { deactivateAccount, userLogin, userLogout, userSignup, verifyEmail, } from "../controllers/authController.js";
import authenticate from "../middlewares/authenticate.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import { HUDDLE_TOKEN } from "../constants/variables.js";
import { cookieOptions } from "../constants/options.js";
const router = Router();
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
}), function (req, res) {
    const user = req.user;
    const payload = {
        id: user._id,
        email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie(HUDDLE_TOKEN, token, cookieOptions);
    return res.redirect(`${process.env.CLIENT_URL}/`);
});
router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/verify-email", verifyEmail);
router.post("/logout", authenticate, userLogout);
router.patch("/deactivate", authenticate, deactivateAccount);
export default router;
