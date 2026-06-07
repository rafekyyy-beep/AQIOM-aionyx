import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('البريد الإلكتروني غير صحيح')
  .min(5)
  .max(100);

export const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير')
  .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير')
  .regex(/[0-9]/, 'يجب أن تحتوي على رقم')
  .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي على رمز خاص');

export const usernameSchema = z
  .string()
  .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
  .max(50, 'اسم المستخدم يجب أن يكون أقل من 50 حرف')
  .regex(/^[a-zA-Z0-9_\u0600-\u06FF]+$/, 'يسمح فقط بالحروف والأرقام والشرطات السفلية');

export const projectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export const messageSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
});

export const memorySchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().min(1).max(5000),
});

export async function validate<T>(data: unknown, schema: z.ZodSchema<T>): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
