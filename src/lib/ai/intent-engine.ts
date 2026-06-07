# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
DEEPSEEK_API_KEY=your_deepseek_key
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_jwt_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AQIOM

# Redis (للـ Rate Limiting الموزع)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Python Agent (اختياري)
PYTHON_AGENT_URL=http://localhost:8000
/**
 * ╔══════════════════════════════════════════════════╗
 * ║         AQIOM ReAct Agent — TypeScript           ║
 * ║   Reason → Act → Observe → Repeat → Answer      ║
 * ╚══════════════════════════════════════════════════╝
 */

import { getGroqClient, ChatMessage } from './groq-client';
import { webSearch, formatSearchResults } from './tools/web-search';
import { calculate } from './tools/calculator';
import { getCurrentDateTime, getDate, getTime, getYear } from './tools/datetime';
import { analyzeText, extractKeywords } from './tools/text-analyzer';
import { logicalReasoner } from './tools/logical-reasoner';

export interface AgentTool {
  name: string;
  description: string;
  params: string[];
  execute: (input: Record<string, string>) => Promise<string> | string;
}

export interface AgentStep {
  iteration: number;
  thought: string;
  type: 'action' | 'final_answer' | 'unknown';
  tool?: string;
  toolInput?: Record<string, string>;
  observation?: string;
  answer?: string;
}

export interface AgentResult {
  question: string;
  answer: string;
  steps: AgentStep[];
  iterations: number;
  durationMs: number;
}

const tools: AgentTool[] = [
  {
    name: 'calculator',
    description: 'حاسبة علمية: جمع، طرح، ضرب، قسمة، جذر تربيعي، قوى، مثلثات، لوغاريتمات',
    params: ['expression: المعادلة الرياضية مثل "sqrt(144)" أو "2^10" أو "sin(30)"'],
    execute: ({ expression }) => calculate(expression),
  },
  {
    name: 'web_search',
    description: 'البحث عن معلومات محدثة على الإنترنت',
    params: ['query: نص البحث مثل "أخبار التقنية" أو "من هو..."'],
    execute: async ({ query }) => formatSearchResults(query),
  },
  {
    name: 'logical_reasoner',
    description: 'تحليل منطقي وفحص صحة الحجج والاستنتاجات',
    params: ['argument: الحجة أو السؤال المنطقي المراد تحليله'],
    execute: ({ argument }) => logicalReasoner(argument),
  },
  {
    name: 'datetime',
    description: 'الحصول على التاريخ والوقت الحالي',
    params: ['format: "full" | "date" | "time" | "year"'],
    execute: ({ format = 'full' }) => {
      if (format === 'date') return getDate();
      if (format === 'time') return getTime();
      if (format === 'year') return getYear();
      return getCurrentDateTime();
    },
  },
  {
    name: 'text_analyzer',
    description: 'تحليل النصوص: تلخيص أو استخراج كلمات مفتاحية',
    params: ['text: النص المراد تحليله', 'task: "summary" | "keywords"'],
    execute: ({ text, task = 'summary' }) => {
      if (task === 'keywords') return extractKeywords(text);
      return analyzeText(text);
    },
  },
];

const toolMap = new Map<string, AgentTool>(tools.map(t => [t.name, t]));

function buildSystemPrompt(): string {
  const toolsDesc = tools
    .map(t => `- ${t.name}: ${t.description}\n  المعاملات: ${t.params.join(' | ')}`)
    .join('\n');

  return `أنت AQIOM Agent — مساعد ذكاء اصطناعي متقدم وذكي للغاية.

تفكيرك يتبع نمط ReAct (Reason → Act → Observe → Answer).

الأدوات المتاحة:
${toolsDesc}

قواعد الإخراج الصارمة — اتبعها حرفياً:

عندما تحتاج أداة:
Thought: [تحليلك المنطقي]
Action: اسم_الأداة
Action Input: {"param": "value"}

عند الانتهاء:
Thought: [تفكيرك الختامي]
Final Answer: [إجابتك الكاملة والمنظمة]

مبادئ:
- فكّر بعمق قبل أي إجابة
- استخدم الأدوات عند الحاجة للبيانات أو الحسابات
- لا تخترع معلومات — إذا لم تعرف، استخدم web_search
- الإجابة النهائية يجب أن تكون واضحة ومنظمة
- تحدث بالعربية دائماً ما لم يطلب المستخدم غير ذلك`;
}

function parseResponse(content: string): Omit<AgentStep, 'iteration'> {
  const thoughtMatch = content.match(/Thought:\s*([\s\S]+?)(?=Action:|Final Answer:|$)/);
  const thought = thoughtMatch?.[1]?.trim() ?? '';

  const finalMatch = content.match(/Final Answer:\s*([\s\S]+)/);
  if (finalMatch) {
    return { type: 'final_answer', thought, answer: finalMatch[1].trim() };
  }

  const actionMatch = content.match(/Action:\s*(\w+)/);
  const inputMatch = content.match(/Action Input:\s*(\{[\s\S]*?\})/);

  if (actionMatch) {
    const tool = actionMatch[1].trim();
    let toolInput: Record<string, string> = {};
    if (inputMatch) {
      try {
        toolInput = JSON.parse(inputMatch[1]);
      } catch {
        toolInput = { raw: inputMatch[1] };
      }
    }
    return { type: 'action', thought, tool, toolInput };
  }

  return { type: 'unknown', thought };
}

export async function runAgent(
  userMessage: string,
  options: {
    maxIterations?: number;
    conversationHistory?: ChatMessage[];
    userMemories?: string;
  } = {}
): Promise<AgentResult> {
  const { maxIterations = 8, conversationHistory = [], userMemories = '' } = options;
  const groq = getGroqClient();
  const startTime = Date.now();

  const systemContent =
    buildSystemPrompt() +
    (userMemories ? `\n\nمعلومات عن المستخدم:\n${userMemories}` : '');

  const messages: ChatMessage[] = [
    { role: 'system', content: systemContent },
    ...conversationHistory.slice(-8),
    { role: 'user', content: userMessage },
  ];

  const steps: AgentStep[] = [];
  let finalAnswer = '';

  for (let i = 1; i <= maxIterations; i++) {
    const response = await groq.chat({
      messages,
      temperature: 0.1,
      maxTokens: 1500,
    });

    const content = response.choices[0]?.message?.content ?? '';

    const parsed = parseResponse(content);
    const step: AgentStep = { iteration: i, ...parsed };

    if (parsed.type === 'final_answer') {
      finalAnswer = parsed.answer ?? '';
      steps.push(step);
      break;
    }

    if (parsed.type === 'action' && parsed.tool) {
      const tool = toolMap.get(parsed.tool);
      let observation: string;

      if (tool) {
        try {
          observation = await tool.execute(parsed.toolInput ?? {});
        } catch (err) {
          observation = `❌ خطأ في تنفيذ الأداة: ${String(err)}`;
        }
      } else {
        const available = Array.from(toolMap.keys()).join(', ');
        observation = `❌ أداة "${parsed.tool}" غير موجودة. المتاح: ${available}`;
      }

      step.observation = observation;
      steps.push(step);

      messages.push({ role: 'assistant', content });
      messages.push({
        role: 'user',
        content: `Observation: ${observation}\n\nاستمر في التفكير.`,
      });
    } else {
      steps.push(step);

      messages.push({ role: 'assistant', content });
      messages.push({
        role: 'user',
        content: 'يرجى الالتزام بالصيغة المطلوبة واستكمال التفكير للوصول للإجابة.',
      });
    }
  }

  if (!finalAnswer) {
    finalAnswer =
      steps.at(-1)?.answer ??
      steps.at(-1)?.thought ??
      'لم أتمكن من الوصول لإجابة واضحة.';
  }

  return {
    question: userMessage,
    answer: finalAnswer,
    steps,
    iterations: steps.length,
    durationMs: Date.now() - startTime,
  };
}
