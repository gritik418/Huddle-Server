import { CorsOptions } from "cors";
import { CookieOptions } from "express";

export const corsOptions: CorsOptions = {
  credentials: true,
  origin: process.env.CLIENT_URL!,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

export const cookieOptions: CookieOptions = {
  sameSite: "none",
  httpOnly: true,
  secure: true,
  maxAge: 1000 * 60 * 60 * 24 * 30,
};
