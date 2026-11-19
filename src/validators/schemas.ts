import { z } from 'zod';

export const chatSchema = z.object({
  npcKey: z.string(),
  language: z.enum(['ar', 'en']),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(500),
    })
  ),
  gameLocation: z
    .object({
      level: z.number().int(),
      x: z.number(),
      z: z.number(),
    })
    .optional(),
});
