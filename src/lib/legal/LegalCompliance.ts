/**
 * AQIOM - الوكيل الذكي الرئيسي
 * يتكامل مع DeepSeek API ويعالج الردود بذكاء فائق
 * يدعم: التحليل العاطفي، إعادة الصياغة، التلخيص، الترجمة، السياق الطويل
 */

import { createClient } from '@/lib/supabase/server';
import { IntentEngine } from './intent-engine';
import { MemoryEngine } from './memory-engine';
import { PromptBuilder } from './prompt-builder';

// أنواع المخرجات المدعومة
export type OutputFormat = 'text' | 'json' | 'markdown' | 'code' | 'structured';
export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'confused' | 'curious';
export type ThinkingStyle = 'analytical' | 'creative' | 'concise' | 'detailed' | 'empathetic';

// واجهة طلب AQIOM
export interface AQIOMRequest {
  message: string;
  userId: string;
  conversationId?: string;
  format?: OutputFormat;
  style?: ThinkingStyle;
  language?: 'ar' | 'en' | 'both';
  maxTokens?: number;
  temperature?: number;
  includeMemories?: boolean;
  includeSources?: boolean;
  projectContext?: string;
  attachedFiles?: Array<{ name: string; content: string; type: string }>;
}

// واجهة رد AQIOM
export interface AQIOMResponse {
  reply: string;
  formattedReply: string;
  emotion: Emotion;
  sources?: Array<{ title: string; url?: string; relevance: number }>;
  memoriesUsed?: string[];
  thinkingTime: number;
  tokenCount: number;
  confidence: number;
  alternativeSuggestions?: string[];
}

// تكوين DeepSeek API
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

// نظام AQIOM الأساسي
const AQIOM_SYSTEM_PROMPT = `أنت AQIOM، وكيل ذكاء اصطناعي فائق الذكاء تم تطويره خصيصاً للمستخدمين العرب والمتكلمين بالإنجليزية.

## هويتك:
- اسمك: AQIOM (أكيوم)
- مطورك: فريق AQIOM
- مهمتك: تقديم ردود منطقية جداً، ذكية، دقيقة، ومفيدة

## شخصيتك:
- ذكي جداً وتحليلي بعمق
- منطقي وموضوعي في الردود
- دقيق في المعلومات (إذا لم تعرف شيئاً، قل لا أعرف)
- متفهم وعاطفياً ذكي
- إبداعي عند الحاجة
- لا تقدم معلومات ضارة أو غير أخلاقية

## أسلوبك:
- استخدم اللغة العربية الفصحى أو الإنجليزية حسب لغة المستخدم
- كن واضحاً ومنظماً في الردود
- استخدم النقاط والأقسام عند الحاجة
- اشرح المفاهيم المعقدة بطريقة مبسطة
- قدم أمثلة عندما يكون ذلك مفيداً

## قدراتك الخاصة:
1. التحليل العاطفي: تفهم مشاعر المستخدم وتتعامل معها بحكمة
2. إعادة الصياغة: تعيد صياغة المعلومات بطرق مختلفة حسب احتياج المستخدم
3. التلخيص: تلخص النصوص الطويلة مع الاحتفاظ بالجوهر
4. الترجمة: تترجم بين العربية والإنجليزية بدقة
5. السياق الطويل: تتذكر تفاصيل المحادثة الطويلة
6. الاستشهاد: تشير إلى مصادر معلوماتك عند الإمكان

## قواعد مهمة:
- الردود المنطقية جداً: استخدم المنطق والاستدلال قبل الإجابة
- لا تتخيل معلومات غير موجودة
- إذا كان السؤال خارج معرفتك، قل "لا أملك معلومات كافية عن هذا"
- احترم خصوصية المستخدم ولا تطلب معلومات شخصية غير ضرورية
- كن إيجابياً وبناءً في ردودك`;

export class AQIOMAgent {
  private intentEngine: IntentEngine;
  private memoryEngine: MemoryEngine;
  private promptBuilder: PromptBuilder;
  private memoryCache: Map<string, any> = new Map();

  constructor() {
    this.intentEngine = new IntentEngine();
    this.memoryEngine = new MemoryEngine();
    this.promptBuilder = new PromptBuilder();
  }

  /**
   * المعالج الرئيسي لطلب AQIOM
   */
  async process(request: AQIOMRequest): Promise<AQIOMResponse> {
    const startTime = Date.now();
    const supabase = await createClient();

    try {
      // 1. تحليل النية
      const intent = this.intentEngine.classify(request.message);
      
      // 2. جلب الذاكرة الخاصة بالمستخدم
      let memories: any[] = [];
      let memoriesUsed: string[] = [];
      
      if (request.includeMemories !== false) {
        memories = await this.memoryEngine.getMemories(request.userId, 8);
        memoriesUsed = memories.map(m => m.key);
      }

      // 3. تحليل المشاعر
      const emotion = await this.detectEmotion(request.message);
      
      // 4. بناء السياق الكامل
      const context = await this.buildContext(request, memories, intent, emotion);
      
      // 5. استدعاء DeepSeek API
      const aiResponse = await this.callDeepSeek(context, request);
      
      // 6. معالجة الرد وتحسينه
      const processedResponse = await this.postProcessResponse(aiResponse, request, emotion);
      
      // 7. حفظ الذاكرة الجديدة (للمعلومات المهمة)
      await this.saveNewMemories(request.userId, request.message, processedResponse.reply);
      
      // 8. حساب الوقت والإحصائيات
      const thinkingTime = Date.now() - startTime;
      const tokenCount = this.estimateTokenCount(processedResponse.reply);
      const confidence = this.calculateConfidence(processedResponse.reply, intent);
      
      // 9. إنشاء اقتراحات بديلة
      const alternativeSuggestions = await this.generateAlternatives(request.message, processedResponse.reply);
      
      // 10. تسجيل الاستخدام
      await this.logUsage(request.userId, intent, tokenCount, thinkingTime);
      
      return {
        reply: processedResponse.rawReply,
        formattedReply: processedResponse.formattedReply,
        emotion: emotion,
        sources: processedResponse.sources,
        memoriesUsed: memoriesUsed,
        thinkingTime: thinkingTime,
        tokenCount: tokenCount,
        confidence: confidence,
        alternativeSuggestions: alternativeSuggestions,
      };
      
    } catch (error) {
      console.error('AQIOM Agent Error:', error);
      
      // رد احتياطي في حالة الخطأ
      return {
        reply: 'عذراً، حدث خطأ تقني أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
        formattedReply: 'عذراً، حدث خطأ تقني أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.',
        emotion: 'neutral',
        thinkingTime: Date.now() - startTime,
        tokenCount: 50,
        confidence: 0.3,
      };
    }
  }

  /**
   * استدعاء DeepSeek API مع تكامل متقدم
   */
  private async callDeepSeek(context: string, request: AQIOMRequest): Promise<any> {
    const temperature = request.temperature || this.getTemperatureByStyle(request.style);
    const maxTokens = request.maxTokens || 2048;
    
    // تكوين الرسائل لـ DeepSeek
    const messages = [
      { role: 'system', content: AQIOM_SYSTEM_PROMPT },
      { role: 'user', content: context }
    ];
    
    // إضافة تاريخ المحادثة إذا وجد
    if (request.conversationId) {
      const history = await this.getConversationHistory(request.conversationId);
      if (history.length > 0) {
        messages.unshift(...history);
      }
    }
    
    const payload = {
      model: DEEPSEEK_MODEL,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: 0.95,
      frequency_penalty: 0.3,
      presence_penalty: 0.3,
      stream: false,
    };
    
    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }
      
      const data = await response.json();
      const rawReply = data.choices?.[0]?.message?.content || '';
      
      return {
        rawReply: rawReply,
        usage: data.usage,
      };
      
    } catch (error) {
      console.error('DeepSeek API call failed:', error);
      // رد احتياطي من AQIOM نفسه
      return {
        rawReply: this.getFallbackResponse(request.message),
        usage: { total_tokens: 100 },
      };
    }
  }

  /**
   * بناء السياق الكامل للطلب
   */
  private async buildContext(
    request: AQIOMRequest,
    memories: any[],
    intent: string,
    emotion: Emotion
  ): Promise<string> {
    const contextParts: string[] = [];
    
    // إضافة معلومات المستخدم
    contextParts.push(`[معلومات المستخدم]`);
    contextParts.push(`النية المتوقعة: ${intent}`);
    contextParts.push(`الحالة العاطفية المتوقعة: ${emotion}`);
    if (request.language) contextParts.push(`اللغة المطلوبة: ${request.language}`);
    if (request.style) contextParts.push(`أسلوب التفكير: ${request.style}`);
    
    // إضافة الذاكرة
    if (memories.length > 0) {
      contextParts.push(`\n[ذاكرة المستخدم]`);
      memories.forEach(m => {
        contextParts.push(`- ${m.key}: ${m.value}`);
      });
    }
    
    // إضافة سياق المشروع
    if (request.projectContext) {
      contextParts.push(`\n[سياق المشروع]`);
      contextParts.push(request.projectContext);
    }
    
    // إضافة الملفات المرفقة
    if (request.attachedFiles && request.attachedFiles.length > 0) {
      contextParts.push(`\n[الملفات المرفقة]`);
      request.attachedFiles.forEach(file => {
        contextParts.push(`--- ${file.name} (${file.type}) ---`);
        contextParts.push(file.content.substring(0, 2000)); // حد أقصى 2000 حرف لكل ملف
      });
    }
    
    // إضافة تنسيق المخرجات المطلوب
    if (request.format && request.format !== 'text') {
      contextParts.push(`\n[تنسيق المخرجات المطلوب]`);
      contextParts.push(`يرجى تقديم الرد بتنسيق ${request.format.toUpperCase()}`);
      if (request.format === 'json') {
        contextParts.push(`التنسيق: {"response": "...", "summary": "...", "keyPoints": [...]}`);
      }
      if (request.format === 'structured') {
        contextParts.push(`استخدم العناوين والأقسام والنقاط المنظمة`);
      }
    }
    
    // إضافة الرسالة الرئيسية
    contextParts.push(`\n[رسالة المستخدم]`);
    contextParts.push(request.message);
    
    // إضافة تعليمات إضافية حسب النية
    if (intent === 'code') {
      contextParts.push(`\n[تعليمات إضافية للكود]`);
      contextParts.push(`- قدم الكود مع شرح خطوة بخطوة`);
      contextParts.push(`- اشرح المنطق قبل كتابة الكود`);
      contextParts.push(`- أضف تعليقات توضيحية داخل الكود`);
    }
    
    if (intent === 'research') {
      contextParts.push(`\n[تعليمات إضافية للبحث]`);
      contextParts.push(`- قدم معلومات دقيقة وموثوقة`);
      contextParts.push(`- ذكر المصادر إن أمكن`);
      contextParts.push(`- قارن بين الآراء المختلفة إذا وجدت`);
    }
    
    if (intent === 'islamic') {
      contextParts.push(`\n[تعليمات إضافية للإسلام]`);
      contextParts.push(`- استخدم الأدلة من القرآن والسنة عند الإمكان`);
      contextParts.push(`- كن دقيقاً في المعلومات الدينية`);
      contextParts.push(`- احترم جميع المذاهب الفقهية`);
    }
    
    return contextParts.join('\n');
  }

  /**
   * معالجة الرد وتحسينه
   */
  private async postProcessResponse(
    aiResponse: any,
    request: AQIOMRequest,
    emotion: Emotion
  ): Promise<{ rawReply: string; formattedReply: string; sources?: any[] }> {
    let rawReply = aiResponse.rawReply;
    let formattedReply = rawReply;
    let sources: any[] = [];
    
    // استخراج المصادر من الرد إذا وجدت
    const sourceMatches = rawReply.match(/\[مصدر: ([^\]]+)\]/g);
    if (sourceMatches) {
      sources = sourceMatches.map(s => ({
        title: s.replace('[مصدر: ', '').replace(']', ''),
        relevance: 0.8,
      }));
      // إزالة علامات المصادر من الرد النهائي
      rawReply = rawReply.replace(/\[مصدر: [^\]]+\]/g, '');
    }
    
    // تحسين التنسيق حسب نوع المخرجات المطلوب
    if (request.format === 'markdown') {
      formattedReply = this.formatAsMarkdown(rawReply);
    } else if (request.format === 'json') {
      formattedReply = JSON.stringify({ response: rawReply }, null, 2);
    } else if (request.format === 'code') {
      formattedReply = '```\n' + rawReply + '\n```';
    } else if (request.format === 'structured') {
      formattedReply = this.formatAsStructured(rawReply);
    }
    
    // تحسين المنطق: إزالة التكرار، تحسين الصياغة
    formattedReply = this.improveLogic(formattedReply);
    
    // تعديل الأسلوب حسب الحالة العاطفية للمستخدم
    formattedReply = this.adaptToEmotion(formattedReply, emotion);
    
    return {
      rawReply: rawReply,
      formattedReply: formattedReply,
      sources: sources.length > 0 ? sources : undefined,
    };
  }

  /**
   * تحليل المشاعر من النص
   */
  private async detectEmotion(text: string): Promise<Emotion> {
    const emotionalWords = {
      happy: ['سعيد', 'فرح', 'ممتاز', 'رائع', 'جميل', 'حلو', 'شكراً'],
      sad: ['حزين', 'بائس', 'صعب', 'صعبة', 'متعب', 'تعبت', 'ألم'],
      angry: ['غاضب', 'غضب', 'مستاء', 'سيء', 'كارثة', 'فشل'],
      excited: ['متحمس', 'حماس', 'رائع', 'مذهل', 'رحلة', 'جديد'],
      confused: ['محتار', 'مش فاهم', 'كيف', 'ماذا', 'ليش', 'لماذا'],
      curious: ['فضول', 'عرف', 'أخبرني', 'شرح', 'تفاصيل', 'كيف يعمل'],
    };
    
    const lowerText = text.toLowerCase();
    
    for (const [emotion, words] of Object.entries(emotionalWords)) {
      for (const word of words) {
        if (lowerText.includes(word)) {
          return emotion as Emotion;
        }
      }
    }
    
    return 'neutral';
  }

  /**
   * حفظ ذكريات جديدة من المحادثة
   */
  private async saveNewMemories(userId: string, userMessage: string, aiReply: string): Promise<void> {
    // استخراج المعلومات المهمة من المحادثة
    const importantPatterns = [
      { pattern: /أحب\s+([^\.]+)/, key: 'الاهتمامات' },
      { pattern: /أفضل\s+([^\.]+)/, key: 'التفضيلات' },
      { pattern: /أعمل\s+في\s+([^\.]+)/, key: 'المجال المهني' },
      { pattern: /عندي\s+خبرة\s+في\s+([^\.]+)/, key: 'الخبرات' },
      { pattern: /أسكن\s+في\s+([^\.]+)/, key: 'الموقع' },
    ];
    
    for (const { pattern, key } of importantPatterns) {
      const match = userMessage.match(pattern);
      if (match && match[1].length < 100) {
        await this.memoryEngine.saveMemory(userId, key, match[1].trim());
      }
    }
  }

  /**
   * تحسين منطق الرد (إزالة التكرار، تحسين الصياغة)
   */
  private improveLogic(text: string): string {
    // إزالة التكرار المتتالي
    let improved = text.replace(/([^.!?]+)[.!?]\s+\1[.!?]/g, '$1.');
    
    // تحسين الصياغة
    improved = improved.replace(/سؤال جيد جدا جدا/g, 'سؤال جيد');
    improved = improved.replace(/شكرا جزيلا جزيلا/g, 'شكراً جزيلاً');
    improved = improved.replace(/بالتأكيد بالتأكيد/g, 'بالتأكيد');
    
    // إضافة نقاط تنظيمية للنصوص الطويلة
    if (improved.length > 500 && !improved.includes('\n') && !improved.includes('1.') && !improved.includes('•')) {
      const sentences = improved.split('. ');
      if (sentences.length > 3) {
        improved = sentences.map((s, i) => `${i + 1}. ${s}.`).join('\n');
      }
    }
    
    return improved;
  }

  /**
   * تكييف الرد حسب مشاعر المستخدم
   */
  private adaptToEmotion(response: string, emotion: Emotion): string {
    switch (emotion) {
      case 'sad':
        return `أتفهم شعورك، ${response}`;
      case 'angry':
        return `أعتذر إن كان هناك ما أزعجك. ${response}`;
      case 'excited':
        return `أنا سعيد بحماسك! ${response}`;
      case 'confused':
        return `دعني أوضح الأمر بشكل أبسط: ${response}`;
      default:
        return response;
    }
  }

  /**
   * تنسيق الرد كـ Markdown
   */
  private formatAsMarkdown(text: string): string {
    // تحويل العناوين
    let formatted = text.replace(/^([^.\n]+)$/gm, (match) => {
      if (match.length < 50 && !match.startsWith('-') && !match.startsWith('•')) {
        return `## ${match}`;
      }
      return match;
    });
    
    // تحويل النقاط
    formatted = formatted.replace(/^-\s+/gm, '• ');
    formatted = formatted.replace(/^\d+\.\s+/gm, (match) => `${match}`);
    
    // إضافة ترقيم للفقرات
    formatted = formatted.replace(/\n\n/g, '\n\n---\n\n');
    
    return formatted;
  }

  /**
   * تنسيق الرد كمنظم
   */
  private formatAsStructured(text: string): string {
    const lines = text.split('\n');
    const structured: string[] = [];
    let currentSection = '';
    
    for (const line of lines) {
      if (line.length < 40 && !line.includes(' ') && line.trim().length > 0) {
        if (currentSection) structured.push(`\n### ${currentSection}`);
        currentSection = line.trim();
      } else if (line.trim().length > 0) {
        structured.push(`  - ${line.trim()}`);
      }
    }
    
    if (currentSection) structured.unshift(`# ${currentSection}`);
    
    return structured.join('\n');
  }

  /**
   * حساب درجة الثقة في الرد
   */
  private calculateConfidence(response: string, intent: string): number {
    let confidence = 0.7;
    
    // كلمات تشير إلى عدم اليقين
    const uncertainWords = ['ربما', 'قد', 'أعتقد', 'على ما أظن', 'ليس لدي علم'];
    for (const word of uncertainWords) {
      if (response.includes(word)) {
        confidence -= 0.1;
      }
    }
    
    // ردود قصيرة جداً
    if (response.length < 20) {
      confidence -= 0.2;
    }
    
    // ردود طويلة ومفصلة
    if (response.length > 500) {
      confidence += 0.1;
    }
    
    // وجود علامات استفهام متعددة في الرد (غير مرغوب)
    if ((response.match(/\?/g) || []).length > 3) {
      confidence -= 0.15;
    }
    
    return Math.min(0.95, Math.max(0.3, confidence));
  }

  /**
   * تقدير عدد التوكنات
   */
  private estimateTokenCount(text: string): number {
    // تقريب تقريبي: 1 توكين ≈ 4 أحرف للعربية، 0.75 كلمة
    const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const englishChars = text.length - arabicChars;
    return Math.ceil(arabicChars / 3.5 + englishChars / 4);
  }

  /**
   * تحديد درجة الحرارة حسب أسلوب التفكير
   */
  private getTemperatureByStyle(style?: ThinkingStyle): number {
    switch (style) {
      case 'analytical': return 0.3;
      case 'creative': return 0.9;
      case 'concise': return 0.2;
      case 'detailed': return 0.6;
      case 'empathetic': return 0.7;
      default: return 0.5;
    }
  }

  /**
   * جلب تاريخ المحادثة
   */
  private async getConversationHistory(conversationId: string): Promise<any[]> {
    const supabase = await createClient();
    const { data } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);
    
    if (!data) return [];
    
    return data.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    }));
  }

  /**
   * رد احتياطي في حالة فشل API
   */
  private getFallbackResponse(message: string): string {
    const fallbacks = [
      `أهلاً بك! أنا AQIOM. أنا هنا لمساعدتك. سؤالك هو: "${message.substring(0, 100)}". هل يمكنك إعادة الصياغة أو توضيح ما تحتاجه بالضبط؟`,
      `شكراً لتواصلك مع AQIOM. أعتذر، هناك بعض المشكلات التقنية حالياً. الرجاء المحاولة مرة أخرى بعد قليل.`,
      `مرحباً! أنا AQIOM. يبدو أن هناك خطأ في الاتصال. يمكنك إعادة كتابة سؤالك أو الاتصال بنا لاحقاً.`,
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  /**
   * إنشاء اقتراحات بديلة
   */
  private async generateAlternatives(message: string, mainReply: string): Promise<string[]> {
    const alternatives: string[] = [];
    
    // إضافة صياغة مختلفة للسؤال
    if (mainReply.length > 100) {
      alternatives.push(`يمكنك أن تطلب مني تلخيص هذه المعلومات بشكل مختصر.`);
    }
    
    // اقتراحات حسب نوع السؤال
    if (message.includes('كيف')) {
      alternatives.push(`هل تريد شرحاً خطوة بخطوة؟`);
    }
    
    if (message.includes('ما هو') || message.includes('ما هي')) {
      alternatives.push(`هل تريد أمثلة تطبيقية على هذا المفهوم؟`);
    }
    
    if (message.includes('قارن')) {
      alternatives.push(`هل تريد جدول مقارنة بين هذه العناصر؟`);
    }
    
    return alternatives.slice(0, 3);
  }

  /**
   * تسجيل استخدام الوكيل
   */
  private async logUsage(userId: string, intent: string, tokenCount: number, thinkingTime: number): Promise<void> {
    const supabase = await createClient();
    await supabase.from('user_activity_logs').insert({
      user_id: userId,
      action_type: 'aqiom_request',
      action_details: {
        intent,
        token_count: tokenCount,
        thinking_time_ms: thinkingTime,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * تدفق الردود (Streaming) للردود الطويلة
   */
  async streamProcess(request: AQIOMRequest, onChunk: (chunk: string) => void): Promise<void> {
    const startTime = Date.now();
    
    try {
      const intent = this.intentEngine.classify(request.message);
      const memories = await this.memoryEngine.getMemories(request.userId, 5);
      const context = await this.buildContext(request, memories, intent, 'neutral');
      
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [
            { role: 'system', content: AQIOM_SYSTEM_PROMPT },
            { role: 'user', content: context }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
        }),
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    onChunk(content);
                  }
                } catch (e) {
                  // تجاهل أخطاء التحليل
                }
              }
            }
          }
        }
      }
      
      const thinkingTime = Date.now() - startTime;
      await this.logUsage(request.userId, intent, 0, thinkingTime);
      
    } catch (error) {
      console.error('Streaming error:', error);
      onChunk('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    }
  }
}

// تصدير نسخة مفردة (Singleton)
export const aqiomAgent = new AQIOMAgent();
