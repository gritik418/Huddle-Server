import { z } from "zod";
declare const updateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    username: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    username?: string | undefined;
    bio?: string | undefined;
}, {
    firstName?: string | undefined;
    lastName?: string | undefined;
    username?: string | undefined;
    bio?: string | undefined;
}>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export default updateUserSchema;
