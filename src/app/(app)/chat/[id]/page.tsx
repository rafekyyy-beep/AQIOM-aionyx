'use client';

import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ChatView } from '@/components/chat/ChatView';
import { useChatStore } from '@/store/chatStore';
import { useEffect } from 'react';

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const { setCurrentConversation } = useChatStore();

  useEffect(() => {
    setCurrentConversation(conversationId);
  }, [conversationId, setCurrentConversation]);

  return (
    <AppShell>
      <ChatView />
    </AppShell>
  );
}
