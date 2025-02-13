import { z } from "zod";
const groupSchema = z
    .object({
    groupName: z
        .string()
        .min(1, "Group Name is required.")
        .min(3, "Group Name must be at least 3 characters long.")
        .min(20, "Group Name can't exceed 20 characters."),
    groupDescription: z
        .string()
        .min(1, "Group Name is required.")
        .min(3, "Group Name must be at least 3 characters long.")
        .min(200, "Group Name can't exceed 200 characters."),
    members: z
        .array(z.string().min(1, "Members are required."))
        .min(2, "There must be at least two members."),
    admins: z.array(z.string()),
})
    .superRefine(({ members, admins }, ctx) => {
    const nonMembers = admins.filter((admin) => !members.includes(admin));
    if (nonMembers.length > 0) {
        ctx.addIssue({
            path: ["admins"],
            message: "Admins must be members.",
            code: z.ZodIssueCode.custom,
        });
    }
});
export default groupSchema;
