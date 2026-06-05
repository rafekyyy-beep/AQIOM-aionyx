import { Intent } from '../intent-engine';
import { IslamicAgent } from './islamic-agent';
import { CodeAgent } from './code-agent';
import { FileAgent } from './file-agent';

export class RouterAgent {
  private islamicAgent = new IslamicAgent();
  private codeAgent = new CodeAgent();
  private fileAgent = new FileAgent();

  async route(intent: Intent, input: string, file?: File): Promise<string> {
    switch (intent) {
      case 'islamic':
        return this.islamicAgent.answer({ type: 'general', question: input });
      
      case 'code':
        return this.codeAgent.generateCode({ language: 'typescript', task: input });
      
      case 'file-analysis':
        if (file) {
          const analysis = await this.fileAgent.analyze(file);
          return `تحليل الملف: ${analysis.filename}\nالحجم: ${analysis.size} bytes\nالنوع: ${analysis.type}`;
        }
        return 'يرجى رفع ملف للتحليل';
      
      default:
        return `[${intent}] معالجة: ${input}`;
    }
  }
}
