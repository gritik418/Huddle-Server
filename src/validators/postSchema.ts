import { z } from "zod";

const postSchema = z.object({
  content: z.string().min(1, "Content is required."),
  mentions: z.array(z.string()).optional(),
  location: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
});

export type PostData = z.infer<typeof postSchema>;

export default postSchema;
