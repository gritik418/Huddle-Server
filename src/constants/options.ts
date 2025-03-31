import { CorsOptions } from "cors";
import { CookieOptions } from "express";

export const corsOptions: CorsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  preflightContinue: false,
  allowedHeaders: ["Authorization", "Content-Type", "Set-Cookie"],
};

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 1000 * 60 * 60 * 24 * 30,
};
