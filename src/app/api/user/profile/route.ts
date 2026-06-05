import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ 
      profile: profile || { id: user.id, email: user.email }
    });
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

    const { username, avatar_url } = await request.json();

    const { data: profile, error } = await supabase
      .from('users')
      .update({ username, avatar_url, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
