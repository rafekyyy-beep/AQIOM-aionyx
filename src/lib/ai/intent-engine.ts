/**
 * Intent Engine — نسخة محسّنة
 * يصنّف نية المستخدم ويقرر هل يستخدم الـ Agent أم الـ Chat البسيط
 */

export type Intent =
  | 'chat'
  | 'code'
  | 'research'
  | 'project'
  | 'memory'
  | 'islamic'
  | 'file-analysis'
  | 'math'
  | 'agent'
  | 'unknown';

export interface ClassificationResult {
  intent: Intent;
  useAgent: boolean;
  confidence: number;
}

export class IntentEngine {
  classify(message: string): ClassificationResult {
    const lower = message.toLowerCase();

    const agentPatterns = [
      /ابحث|بحث عن|اعثر|ابحثلي/,
      /احسب|احسب لي|ما ناتج|كم يساوي|حل المعادلة/,
      /قارن|الفرق بين|أيهما أفضل|مقارنة/,
      /حلّل|تحليل|افحص/,
      /خطوة بخطوة|step by step|شرح مفصل/,
      /ما هو.*و.*ما هو|ما الفرق/,
      /\d+.*[\+\-\*\/\^].*\d+/,
      /sqrt|log|factorial|sin|cos|tan|جذر|لوغاريتم/,
      /طقس|الطقس|حرارة|درجة الحرارة/,
      /خبر|أخبار|آخر الأخبار/,
      /ترجم|ترجمة|translate/,
    ];

    for (const pattern of agentPatterns) {
      if (pattern.test(lower)) {
        return { intent: 'agent', useAgent: true, confidence: 0.95 };
      }
    }

    if (/اكتب كود|برنامج|function|كلاس|class|دالة|كود/.test(lower)) {
      return { intent: 'code', useAgent: false, confidence: 0.85 };
    }
    if (/مشروع|project/.test(lower)) {
      return { intent: 'project', useAgent: false, confidence: 0.8 };
    }
    if (/تذكر|ذكرني|احفظ|حفظ/.test(lower)) {
      return { intent: 'memory', useAgent: false, confidence: 0.9 };
    }
    if (/قرآن|دعاء|صلاة|إسلامي|حديث|سورة|آية/.test(lower)) {
      return { intent: 'islamic', useAgent: false, confidence: 0.9 };
    }
    if (/ملف|pdf|تحليل ملف|docx|word|excel/.test(lower)) {
      return { intent: 'file-analysis', useAgent: false, confidence: 0.85 };
    }

    if (message.length > 100 || (message.includes('؟') && message.length > 50)) {
      return { intent: 'agent', useAgent: true, confidence: 0.7 };
    }

    return { intent: 'chat', useAgent: false, confidence: 0.8 };
  }
}
