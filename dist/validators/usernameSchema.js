import { z } from "zod";
const usernameSchema = z
    .string()
    .min(1, "Username is required.")
    .min(3, "Username must be at least 3 characters long.")
    .max(15, "Username can't exceed 15 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores.");
export default usernameSchema;
