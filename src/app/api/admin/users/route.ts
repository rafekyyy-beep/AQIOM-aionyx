import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// التحقق من صلاحيات المشرف
async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: user } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', userId)
    .single();
  
  return user?.subscription_status === 'enterprise';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    if (!await isAdmin(user.id)) {
      return NextResponse.json({ error: 'غير مصرح - صلاحيات مشرف مطلوبة' }, { status: 403 });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

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

    const { userId, updates } = await request.json();

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
