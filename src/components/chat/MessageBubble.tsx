import { cn } from '@/lib/utils/cn';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'max-w-[80%] p-3 rounded-lg',
        role === 'user'
          ? 'bg-primary-600 ml-auto'
          : 'bg-surface border border-border'
      )}
    >
      <p className="text-white whitespace-pre-wrap">{content}</p>
    </div>
  );
}
