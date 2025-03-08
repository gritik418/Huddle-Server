import { z } from "zod";
declare const groupSchema: z.ZodEffects<z.ZodObject<{
    groupName: z.ZodString;
    groupDescription: z.ZodString;
    members: z.ZodArray<z.ZodString, "many">;
    admins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    groupName: string;
    groupDescription: string;
    members: string[];
    admins?: string[] | undefined;
}, {
    groupName: string;
    groupDescription: string;
    members: string[];
    admins?: string[] | undefined;
}>, {
    groupName: string;
    groupDescription: string;
    members: string[];
    admins?: string[] | undefined;
}, {
    groupName: string;
    groupDescription: string;
    members: string[];
    admins?: string[] | undefined;
}>;
export type GroupData = z.infer<typeof groupSchema>;
export default groupSchema;
