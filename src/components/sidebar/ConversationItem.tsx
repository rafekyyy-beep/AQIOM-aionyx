'use client';

import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { MoreVertical, Trash2, Pin } from 'lucide-react';

interface ConversationItemProps {
  id: string;
  title: string;
  isActive?: boolean;
}

export function ConversationItem({ id, title, isActive }: ConversationItemProps) {
  const router = useRouter();
  const { deleteConversation } = useChatStore();

  const handleClick = () => {
    router.push(`/chat/${id}`);
  };

  const handleDelete = () => {
    deleteConversation(id);
    if (isActive) {
      router.push('/chat');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
        isActive ? 'bg-primary-600' : 'hover:bg-border'
      }`}
    >
      <span className="truncate flex-1">{title}</span>
      
      <Dropdown
        trigger={
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        }
        align="right"
      >
        <DropdownItem onClick={handleDelete}>
          <Trash2 className="w-4 h-4 inline ml-2" />
          حذف
        </DropdownItem>
      </Dropdown>
    </div>
  );
}
