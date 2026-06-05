export type Intent = 
  | 'chat'
  | 'code'
  | 'research'
  | 'project'
  | 'memory'
  | 'islamic'
  | 'file-analysis'
  | 'unknown';

export class IntentEngine {
  classify(message: string): Intent {
    const lower = message.toLowerCase();

    if (lower.includes('اكتب كود') || lower.includes('برنامج') || lower.includes('function')) {
      return 'code';
    }
    if (lower.includes('بحث') || lower.includes('معلومة') || lower.includes('ما هو')) {
      return 'research';
    }
    if (lower.includes('مشروع') || lower.includes('project')) {
      return 'project';
    }
    if (lower.includes('تذكر') || lower.includes('ذكرني') || lower.includes('احفظ')) {
      return 'memory';
    }
    if (lower.includes('قرآن') || lower.includes('دعاء') || lower.includes('صلاة') || lower.includes('إسلامي')) {
      return 'islamic';
    }
    if (lower.includes('ملف') || lower.includes('pdf') || lower.includes('تحليل')) {
      return 'file-analysis';
    }

    return 'chat';
  }
}
