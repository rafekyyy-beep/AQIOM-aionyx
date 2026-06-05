import { create } from 'zustand';

interface ChatState {
  conversations: Array<{ id: string; title: string; updatedAt: Date }>;
  currentConversationId: string | null;
  setCurrentConversation: (id: string) => void;
  addConversation: (title: string) => void;
  deleteConversation: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentConversationId: null,
  
  setCurrentConversation: (id) => set({ currentConversationId: id }),
  
  addConversation: (title) => set((state) => ({
    conversations: [
      { id: Date.now().toString(), title, updatedAt: new Date() },
      ...state.conversations,
    ],
    currentConversationId: Date.now().toString(),
  })),
  
  deleteConversation: (id) => set((state) => ({
    conversations: state.conversations.filter((c) => c.id !== id),
    currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
  })),
}));
