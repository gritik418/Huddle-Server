import { z } from "zod";
declare const groupSchema: z.ZodEffects<z.ZodObject<{
    groupName: z.ZodString;
    groupDescription: z.ZodString;
    members: z.ZodArray<z.ZodString, "many">;
    admins: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    groupName: string;
    groupDescription: string;
    members: string[];
    admins: string[];
}, {
    groupName: string;
    groupDescription: string;
    members: string[];
    admins: string[];
}>, {
    groupName: string;
    groupDescription: string;
    members: string[];
    admins: string[];
}, {
    groupName: string;
    groupDescription: string;
    members: string[];
    admins: string[];
}>;
export type GroupData = z.infer<typeof groupSchema>;
export default groupSchema;
