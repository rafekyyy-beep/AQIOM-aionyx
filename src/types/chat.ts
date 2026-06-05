export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
}
