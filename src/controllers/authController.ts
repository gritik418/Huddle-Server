import { Request, Response } from "express";
import signupSchema, { SignupData } from "../validators/signupSchema.js";
import User from "../models/User.js";
import generateOTP from "../utils/generateOTP.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/sendEmail.js";
import emailVerificationTemplate from "../email-templates/verification-email.js";
import Mail from "nodemailer/lib/mailer/index.js";
import loginSchema, { LoginData } from "../validators/loginSchema.js";
import { HUDDLE_TOKEN } from "../constants/variables.js";
import { cookieOptions } from "../constants/options.js";
import jwt from "jsonwebtoken";

export const userSignup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const data: SignupData = req.body;
    const result = signupSchema.safeParse(data);

    if (!result.success) {
      const errors: { [name: string]: string } = {};
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
      } else {
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
      } else {
        await User.findByIdAndDelete(emailExists._id);
      }
    }

    const verificationCode: string = generateOTP().toString();
    const passwordSalt: string = await bcrypt.genSalt(8);
    const verificationCodeSalt: string = await bcrypt.genSalt(8);
    const hashedVerificationCode: string = await bcrypt.hash(
      verificationCode,
      verificationCodeSalt
    );
    const hashedPassword: string = await bcrypt.hash(password, passwordSalt);

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

    const mailOptions: Mail.Options = {
      from: "huddle@gmail.com",
      to: email,
      html: emailVerificationTemplate(verificationCode, firstName, lastName),
      text: `Welcome! Your verification code is: ${verificationCode}. Use this code to verify your Huddle account.`,
      subject: "Verify Your Huddle Account",
    };
    await sendEmail(mailOptions);

    return res.status(201).json({
      success: true,
      message:
        "Your account has been created! Check your email to verify your account.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const userLogin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const data: LoginData = req.body;
    const result = loginSchema.safeParse(data);

    if (!result.success) {
      const errors: { [name: string]: string } = {};
      result.error.errors.forEach((error) => {
        errors[error.path[0]] = error.message;
      });

      return res.status(400).json({
        success: false,
        message: "Validation Error.",
        errors,
      });
    }
    const { identifier, password } = result.data;

    const user: User | null = await User.findOne({
      $or: [
        {
          username: identifier,
        },
        {
          email: identifier,
        },
      ],
      isVerified: true,
      provider: "credentials",
    }).select("password email");

    if (!user || !user.password)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });

    const verifyPassword: boolean = await bcrypt.compare(
      password,
      user.password
    );

    if (!verifyPassword)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });

    const payload: JWT_Payload = {
      id: user._id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!);

    return res.status(200).cookie(HUDDLE_TOKEN, token, cookieOptions).json({
      success: true,
      message: "Logged in successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, otp } = req.body;

    const user: User | null = await User.findOne({ email, isVerified: false });
    if (!user)
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });

    if (
      !user.verificationCode ||
      !user.verificationCodeExpiry ||
      new Date(user.verificationCodeExpiry).getTime() < new Date().getTime()
    ) {
      await User.findByIdAndDelete(user._id);
      return res.status(401).json({
        success: false,
        message: "OTP Expired.",
      });
    }

    const verifyOtp: boolean = await bcrypt.compare(otp, user.verificationCode);
    if (!verifyOtp) {
      await User.findByIdAndDelete(user._id);
      return res.status(401).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    await User.findByIdAndUpdate(user._id, {
      $set: {
        verificationCode: null,
        verificationCodeExpiry: null,
        isVerified: true,
      },
    });

    const payload: JWT_Payload = {
      id: user._id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!);

    return res.status(200).cookie(HUDDLE_TOKEN, token, cookieOptions).json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};

export const userLogout = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    return res.status(200).clearCookie(HUDDLE_TOKEN, cookieOptions).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unexpected server error. Please try again later.",
    });
  }
};
