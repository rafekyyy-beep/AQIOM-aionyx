import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.csv', '.doc', '.docx'];

function isFileAllowed(filename: string, mimeType: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return ALLOWED_MIME_TYPES.includes(mimeType) && ALLOWED_EXTENSIONS.includes(ext);
}

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

    // التحقق من نوع الملف
    if (!isFileAllowed(file.name, file.type)) {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 });
    }

    // التحقق من حجم الملف (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'الملف كبير جداً (الحد الأقصى 10MB)' }, { status: 400 });
    }

    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    
    // رفع الملف إلى Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'فشل رفع الملف' }, { status: 500 });
    }

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

    // إذا فشلت قاعدة البيانات، احذف الملف من التخزين
    if (dbError) {
      await supabase.storage.from('files').remove([fileName]);
      console.error('DB error:', dbError);
      return NextResponse.json({ error: 'فشل حفظ معلومات الملف' }, { status: 500 });
    }

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
