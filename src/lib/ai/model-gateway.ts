export type ModelProvider = 'together' | 'groq';
export type ModelName = 'qwen3-72b' | 'qwen3-235b' | 'llama3-70b' | 'llama3-8b';

interface ModelConfig {
  provider: ModelProvider;
  model: ModelName;
  apiKey: string;
  baseUrl?: string;
}

export class ModelGateway {
  private config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  async generate(prompt: string): Promise<string> {
    const response = await fetch(this.getEndpoint(), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private getEndpoint(): string {
    if (this.config.provider === 'together') {
      return 'https://api.together.xyz/v1/chat/completions';
    }
    return 'https://api.groq.com/openai/v1/chat/completions';
  }
}
