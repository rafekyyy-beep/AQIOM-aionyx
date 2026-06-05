import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deepseekClient } from '@/lib/ai/deepseek-client';
import { IntentEngine } from '@/lib/ai/intent-engine';
import { MemoryEngine } from '@/lib/ai/memory-engine';

export async function POST(request: NextRequest) {
  try {
    // ✅ إضافة التحقق من المصادقة أولاً
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح - يرجى تسجيل الدخول' }, { status: 401 });
    }

    const { message, conversationId } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 });
    }

    // حفظ رسالة المستخدم
    if (conversationId) {
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: 'user',
          content: message,
        });

      if (insertError) {
        console.error('Failed to save message:', insertError);
      }
    }

    // جلب الذاكرة
    const memoryEngine = new MemoryEngine();
    const memories = await memoryEngine.getMemories(user.id, 5);

    // بناء رسائل DeepSeek
    const messages = [
      {
        role: 'system' as const,
        content: `أنت AQIOM، مساعد ذكي ومفيد. تحدث باللغة العربية.
        معلومات عن المستخدم: ${memories.map(m => `${m.key}: ${m.value}`).join(', ')}`,
      },
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // الاتصال بـ DeepSeek
    const response = await deepseekClient.chat({ messages });
    const reply = response.choices[0]?.message?.content || 'عذراً، لم أتمكن من معالجة طلبك';

    // حفظ رد المساعد
    if (conversationId) {
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: 'assistant',
          content: reply,
        });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في المعالجة' },
      { status: 500 }
    );
  }
}
