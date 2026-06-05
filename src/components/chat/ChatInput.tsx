import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t border-border bg-background">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="اسأل أي شيء..."
        className="flex-1 p-3 bg-surface rounded-lg border border-border focus:outline-none focus:border-primary-500"
        disabled={isLoading}
      />
      <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
        {isLoading ? '...' : 'إرسال'}
      </Button>
    </div>
  );
}
