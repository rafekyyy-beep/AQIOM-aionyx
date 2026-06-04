import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'الرسالة مطلوبة' },
        { status: 400 }
      );
    }

    // رد تجريبي مؤقت - سيتم استبداله بـ AI لاحقاً
    const reply = `مرحباً! أنا AQIOM. رسالتك هي: "${message}"\n\n(هذا رد تجريبي، سيتم ربط الذكاء الاصطناعي قريباً)`;

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في المعالجة' },
      { status: 500 }
    );
  }
}
