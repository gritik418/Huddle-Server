import signupSchema from "../validators/signupSchema.js";
import User from "../models/User.js";
import generateOTP from "../utils/generateOTP.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";
import emailVerificationTemplate from "../email-templates/verification-email.js";
export const userSignup = async (req, res) => {
    try {
        const data = req.body;
        const result = signupSchema.safeParse(data);
        if (!result.success) {
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
        const { firstName, lastName = "", email, username, password } = result.data;
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            if (usernameExists.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Username already exists.",
                });
            }
            else {
                await User.findByIdAndDelete(usernameExists._id);
            }
        }
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            if (emailExists.isVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists.",
                });
            }
            else {
                await User.findByIdAndDelete(emailExists._id);
            }
        }
        const verificationCode = generateOTP().toString();
        const passwordSalt = await bcrypt.genSalt(8);
        const verificationCodeSalt = await bcrypt.genSalt(8);
        const hashedVerificationCode = await bcrypt.hash(verificationCode, verificationCodeSalt);
        const hashedPassword = await bcrypt.hash(password, passwordSalt);
        const user = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            username: username,
            password: hashedPassword,
            verificationCode: hashedVerificationCode,
            verificationCodeExpiry: Date.now() + 10 * 60 * 1000,
        });
        await user.save();
        await sendEmail(verificationCode, email, "Verify Your Huddle Account", `Welcome! Your verification code is: ${verificationCode}. Use this code to verify your Huddle account.`, emailVerificationTemplate(verificationCode, firstName, lastName));
        return res.status(200).json({
            success: true,
            message: "Your account has been created! Check your email to verify your account.",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
export const userLogin = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unexpected server error. Please try again later.",
        });
    }
};
