import { Memory } from './memory-engine';

interface PromptContext {
  systemPrompt?: string;
  memories?: Memory[];
  history?: Array<{ role: string; content: string }>;
  userMessage: string;
}

export class PromptBuilder {
  build(context: PromptContext): string {
    const parts: string[] = [];

    // System prompt
    if (context.systemPrompt) {
      parts.push(`[System]\n${context.systemPrompt}\n`);
    }

    // Memories
    if (context.memories && context.memories.length > 0) {
      const memoriesText = context.memories
        .map(m => `${m.key}: ${m.value}`)
        .join('\n');
      parts.push(`[Memory]\n${memoriesText}\n`);
    }

    // Chat history
    if (context.history && context.history.length > 0) {
      const historyText = context.history
        .slice(-10)
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');
      parts.push(`[History]\n${historyText}\n`);
    }

    // User message
    parts.push(`[User]\n${context.userMessage}\n`);
    parts.push(`[Assistant]\n`);

    return parts.join('\n');
  }
}
