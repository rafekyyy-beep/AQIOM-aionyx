'use client';

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<Array<{role: string; content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply || 'عذراً، حدث خطأ' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'حدث خطأ في الاتصال' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user'
                ? 'bg-primary-600 ml-auto'
                : 'bg-surface border border-border'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="bg-surface p-3 rounded-lg max-w-[80%]">
            <div className="flex gap-1">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-100">●</span>
              <span className="animate-pulse delay-200">●</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="اسأل أي شيء..."
            className="flex-1 p-3 bg-surface rounded-lg border border-border focus:outline-none focus:border-primary-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-6 py-3 bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            إرسال
          </button>
        </div>
      </div>
    </div>
  );
          }
