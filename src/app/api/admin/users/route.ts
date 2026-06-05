import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// التحقق من صلاحيات المشرف - تم التصحيح
async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: user } = await supabase
    .from('users')
    .select('role')  // حقل منفصل للصلاحيات
    .eq('id', userId)
    .single();
  
  return user?.role === 'admin';  // ليس subscription_status
}

// تحديث المستخدم - قائمة بيضاء
const updateUserSchema = z.object({
  userId: z.string().uuid(),
  updates: z.object({
    username: z.string().min(3).optional(),
    full_name: z.string().optional(),
    avatar_url: z.string().url().optional(),
    role: z.enum(['user', 'admin']).optional(),
    subscription_status: z.enum(['free', 'pro', 'enterprise']).optional(),
    is_active: z.boolean().optional(),
  }).strict()  // يمنع الحقول غير المسموحة
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    if (!await isAdmin(user.id)) {
      return NextResponse.json({ error: 'غير مصرح - صلاحيات مشرف مطلوبة' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 });
    }

    const { userId, updates } = validation.data;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
