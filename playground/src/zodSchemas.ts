import { z } from 'zod';

export const PostZodSchema = z.object({
  id: z.string().uuid().describe('The unique identifier of the post'),
  content: z.string().describe('The content of the post'),
  userId: z.string().uuid().describe('The unique identifier of the user who created the post'),
});
export type Post = z.infer<typeof PostZodSchema>;

export const UserZodSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  passcode: z.number().min(1000).max(9999),
  name: z.string().min(3),
});
export type User = z.infer<typeof UserZodSchema>;
