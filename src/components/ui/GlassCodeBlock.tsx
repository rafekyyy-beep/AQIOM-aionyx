'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface GlassCodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function GlassCodeBlock({ code, language = 'javascript', showLineNumbers = true }: GlassCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className="relative rounded-xl overflow-hidden backdrop-blur-xl bg-black/40 border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-xs text-gray-400">{language}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
        </button>
      </div>
      <div className="p-4 overflow-auto max-h-96">
        <pre className="text-sm text-gray-300 font-mono">
          {showLineNumbers ? (
            lines.map((line, index) => (
              <div key={index} className="flex gap-4">
                <span className="text-gray-500 select-none w-8 text-right">{index + 1}</span>
                <span>{line || ' '}</span>
              </div>
            ))
          ) : (
            code
          )}
        </pre>
      </div>
    </div>
  );
}
