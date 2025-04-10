import { HUDDLE_TOKEN } from "../constants/variables.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies[HUDDLE_TOKEN];
        if (!token)
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        const verify = jwt.verify(token, process.env.JWT_SECRET);
        if (!verify || !verify.id)
            return res.status(401).json({
                success: false,
                message: "Please Login.",
            });
        const user = await User.findById(verify.id);
        if (!user)
            throw new Error("User not found");
        if (user.isDeactivated) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please login to reactivate.",
            });
        }
        req.params.userId = verify.id;
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "Please log in again.",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export default authenticate;
