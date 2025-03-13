export const corsOptions = {
    // origin: process.env.CLIENT_URL,
    credentials: true,
    origin: ["http://localhost:3000", "https://huddle-app-silk.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
export const cookieOptions = {
    sameSite: "none",
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,
};
