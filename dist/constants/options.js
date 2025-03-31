export const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    preflightContinue: false,
    allowedHeaders: ["Authorization", "Content-Type", "Set-Cookie"],
};
export const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 30,
};
