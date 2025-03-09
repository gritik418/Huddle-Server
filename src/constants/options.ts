import { CorsOptions } from "cors";
import { CookieOptions } from "express";

export const corsOptions: CorsOptions = {
  credentials: true,
  origin: ["http://localhost:3000", "https://huddle-app-silk.vercel.app"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

export const cookieOptions: CookieOptions = {
  sameSite: "none",
  httpOnly: true,
  secure: true,
  maxAge: 1000 * 60 * 60 * 24 * 30,
};
