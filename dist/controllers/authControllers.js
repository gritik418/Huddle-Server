import signupSchema from "../validators/signupSchema.js";
export const userSignup = async (req, res) => {
    try {
        const data = req.body;
        const result = signupSchema.safeParse(data);
        if (!result.success) {
            if (result.error) {
                const errors = {};
                result.error.errors.forEach((error) => {
                    errors[error.path[0]] = error.message;
                });
                return res.status(400).json({
                    success: false,
                    message: "Validation Error.",
                    errors,
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: "Something went wrong.",
                });
            }
        }
        return res.status(200).json({
            success: true,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error.",
        });
    }
};
export const userLogin = async (req, res) => {
    try {
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error.",
        });
    }
};
