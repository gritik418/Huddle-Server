import { z } from "zod";
declare const postSchema: z.ZodObject<{
    content: z.ZodString;
    mentions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    location: z.ZodOptional<z.ZodString>;
    hashtags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    content: string;
    mentions?: string[] | undefined;
    location?: string | undefined;
    hashtags?: string[] | undefined;
}, {
    content: string;
    mentions?: string[] | undefined;
    location?: string | undefined;
    hashtags?: string[] | undefined;
}>;
export type PostData = z.infer<typeof postSchema>;
export default postSchema;
