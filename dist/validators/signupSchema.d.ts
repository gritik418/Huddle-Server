import z from "zod";
declare const signupSchema: z.ZodEffects<z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    passwordConfirmation: z.ZodString;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    lastName?: string | undefined;
}, {
    firstName: string;
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    lastName?: string | undefined;
}>, {
    firstName: string;
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    lastName?: string | undefined;
}, {
    firstName: string;
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    lastName?: string | undefined;
}>;
export type SignupData = z.infer<typeof signupSchema>;
export default signupSchema;
