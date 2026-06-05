import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    if (!file) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 });
    }

    const { data: urlData } = supabase.storage
      .from('files')
      .getPublicUrl(file.path);

    return NextResponse.json({ file: { ...file, url: urlData.publicUrl } });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // جلب معلومات الملف
    const { data: file, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;

    if (!file) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 });
    }

    // حذف الملف من Storage
    await supabase.storage.from('files').remove([file.path]);

    // حذف السجل من قاعدة البيانات
    await supabase.from('files').delete().eq('id', params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
