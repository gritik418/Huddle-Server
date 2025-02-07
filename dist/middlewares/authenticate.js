import { HUDDLE_TOKEN } from "../constants/variables";
const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies[HUDDLE_TOKEN];
        console.log(token);
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export default authenticate;
