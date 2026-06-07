import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGroqClient } from '@/lib/ai/groq-client';
import { runAgent } from '@/lib/ai/react-agent';
import { IntentEngine } from '@/lib/ai/intent-engine';
import { MemoryEngine } from '@/lib/ai/memory-engine';

const intentEngine = new IntentEngine();

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'غير مصرح — يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, conversationId, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 });
    }

    if (conversationId) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'user',
        content: message,
      });
    }

    const memoryEngine = new MemoryEngine();
    const memories = await memoryEngine.getMemories(user.id, 5);
    const memoriesText = memories.map(m => `${m.key}: ${m.value}`).join('\n');

    const classification = intentEngine.classify(message);

    let reply: string;
    let agentSteps: unknown[] = [];

    if (classification.useAgent) {
      const result = await runAgent(message, {
        maxIterations: 8,
        conversationHistory: history,
        userMemories: memoriesText,
      });

      reply = result.answer;
      agentSteps = result.steps;

    } else {
      const groq = getGroqClient();

      const systemPrompt = [
        'أنت AQIOM، مساعد ذكاء اصطناعي ذكي ومفيد. تحدث بالعربية.',
        memoriesText ? `معلومات عن المستخدم:\n${memoriesText}` : '',
        classification.intent === 'code'
          ? 'أنت متخصص في كتابة كود برمجي احترافي ومشروح.'
          : '',
        classification.intent === 'islamic'
          ? 'أجب بأسلوب علمي إسلامي محترم مع الاستشهاد بالمصادر.'
          : '',
      ].filter(Boolean).join('\n\n');

      const response = await groq.chat({
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6),
          { role: 'user', content: message },
        ],
        temperature: 0.3,
        maxTokens: 1500,
      });

      reply =
        response.choices[0]?.message?.content ??
        'عذراً، لم أتمكن من معالجة طلبك.';
    }

    if (conversationId) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'assistant',
        content: reply,
      });
    }

    return NextResponse.json({
      reply,
      intent: classification.intent,
      agentMode: classification.useAgent,
      steps: classification.useAgent ? agentSteps.length : 0,
    });

  } catch (error) {
    console.error('Chat API Error:', error);

    return NextResponse.json(
      { error: 'حدث خطأ في المعالجة' },
      { status: 500 }
    );
  }
}
