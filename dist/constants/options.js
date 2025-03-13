export const corsOptions = {
    credentials: true,
    origin: ["http://localhost:3000", "https://huddle-app-silk.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Access-Control-Allow-Credentials",
        "Access-Control-Allow-Headers",
    ],
    preflightContinue: true,
};
export const cookieOptions = {
    sameSite: "none",
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,
};
