-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'محادثة جديدة',
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memories table
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_memories_user_id ON public.memories(user_id);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_select_own ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (auth.uid() = id);

-- Conversations policies
CREATE POLICY conversations_select_own ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY conversations_insert_own ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY conversations_update_own ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY conversations_delete_own ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY messages_select_own ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
);
CREATE POLICY messages_insert_own ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND user_id = auth.uid())
);

-- Memories policies
CREATE POLICY memories_select_own ON public.memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY memories_insert_own ON public.memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY memories_delete_own ON public.memories FOR DELETE USING (auth.uid() = user_id);
