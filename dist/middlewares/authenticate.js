import { HUDDLE_TOKEN } from "../constants/variables.js";
import jwt from "jsonwebtoken";
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
