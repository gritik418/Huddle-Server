import { z } from "zod";
declare const loginSchema: z.ZodObject<{
    identifier: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    identifier: string;
}, {
    password: string;
    identifier: string;
}>;
export type LoginData = z.infer<typeof loginSchema>;
export default loginSchema;
