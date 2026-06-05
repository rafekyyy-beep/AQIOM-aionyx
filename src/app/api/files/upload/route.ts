import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'الملف مطلوب' }, { status: 400 });
    }

    // التحقق من حجم الملف (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'الملف كبير جداً (الحد الأقصى 10MB)' }, { status: 400 });
    }

    // رفع الملف إلى Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // حفظ معلومات الملف في قاعدة البيانات
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        name: file.name,
        path: fileName,
        type: file.type,
        size: file.size,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // الحصول على URL عام للملف
    const { data: urlData } = supabase.storage
      .from('files')
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      file: { ...fileRecord, url: urlData.publicUrl },
      success: true 
    }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الرفع' }, { status: 500 });
  }
}
