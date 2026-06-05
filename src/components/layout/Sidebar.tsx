'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { conversations, currentConversationId, addConversation, deleteConversation, setCurrentConversation } = useChatStore();

  return (
    <>
      {/* زر فتح القائمة على الشاشات الصغيرة */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface rounded-lg border border-border"
      >
        ☰
      </button>

      {/* القائمة الجانبية */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-surface border-l border-border z-40
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-4">
          <Button onClick={() => addConversation('محادثة جديدة')} className="w-full mb-4">
            <Plus className="w-4 h-4 ml-2" />
            محادثة جديدة
          </Button>

          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setCurrentConversation(conv.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conv.id
                    ? 'bg-primary-600'
                    : 'hover:bg-border'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="p-1 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* الخلفية المظلمة للقائمة على الموبايل */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
