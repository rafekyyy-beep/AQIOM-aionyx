'use client';

import { useChatStore } from '@/store/chatStore';
import { ConversationItem } from './ConversationItem';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Plus, MessageSquare, Settings, BookOpen, Moon } from 'lucide-react';
import Link from 'next/link';

export function SidebarContent() {
  const { conversations, addConversation } = useChatStore();
  const pathname = usePathname();

  const handleNewChat = () => {
    addConversation('محادثة جديدة');
  };

  return (
    <div className="h-full flex flex-col">
      {/* زر محادثة جديدة */}
      <div className="p-4">
        <Button onClick={handleNewChat} className="w-full">
          <Plus className="w-4 h-4 ml-2" />
          محادثة جديدة
        </Button>
      </div>

      {/* قائمة المحادثات */}
      <div className="flex-1 overflow-auto px-2 space-y-1">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            id={conv.id}
            title={conv.title}
            isActive={pathname === `/chat/${conv.id}`}
          />
        ))}
      </div>

      {/* القائمة السفلية */}
      <div className="p-4 border-t border-border space-y-2">
        <Link href="/memory">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-border transition-colors cursor-pointer">
            <BookOpen className="w-5 h-5" />
            <span>الذاكرة</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-border transition-colors cursor-pointer">
            <Settings className="w-5 h-5" />
            <span>الإعدادات</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
