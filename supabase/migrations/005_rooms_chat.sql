-- جدول الغرف
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'public' CHECK (type IN ('public', 'private', 'team')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول أعضاء الغرف
CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- جدول رسائل الغرف
CREATE TABLE IF NOT EXISTS public.room_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- الفهارس
CREATE INDEX idx_rooms_type ON public.rooms(type);
CREATE INDEX idx_room_members_room_id ON public.room_members(room_id);
CREATE INDEX idx_room_members_user_id ON public.room_members(user_id);
CREATE INDEX idx_room_messages_room_id ON public.room_messages(room_id);
CREATE INDEX idx_room_messages_created_at ON public.room_messages(created_at);

-- تفعيل RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- سياسات الغرف
CREATE POLICY rooms_select_public ON public.rooms FOR SELECT USING (type = 'public' OR EXISTS (
  SELECT 1 FROM public.room_members WHERE room_id = id AND user_id = auth.uid()
));

-- سياسات الأعضاء
CREATE POLICY room_members_select_own ON public.room_members FOR SELECT USING (user_id = auth.uid());

-- سياسات الرسائل
CREATE POLICY room_messages_select ON public.room_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.room_members WHERE room_id = room_messages.room_id AND user_id = auth.uid())
);

CREATE POLICY room_messages_insert ON public.room_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.room_members WHERE room_id = room_messages.room_id AND user_id = auth.uid())
);
