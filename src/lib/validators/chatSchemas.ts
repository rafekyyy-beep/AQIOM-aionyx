import { z } from 'zod';

export const messageSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
});

export const conversationSchema = z.object({
  title: z.string().min(1).max(100),
});

export type MessageInput = z.infer<typeof messageSchema>;
export type ConversationInput = z.infer<typeof conversationSchema>;
