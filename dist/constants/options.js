export const corsOptions = {
    credentials: true,
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};
export const cookieOptions = {
    sameSite: "none",
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
};
