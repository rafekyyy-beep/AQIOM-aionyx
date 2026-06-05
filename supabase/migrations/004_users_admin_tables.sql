-- توسيع جدول المستخدمين
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'enterprise'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_messages INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_conversations INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_model TEXT DEFAULT 'qwen3-72b';

-- جدول سجل النشاطات
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول جلسات المستخدمين
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_name TEXT,
  device_type TEXT,
  ip_address TEXT,
  location TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول خطط الاشتراك
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10, 2),
  price_yearly DECIMAL(10, 2),
  max_messages_per_day INTEGER,
  max_projects INTEGER,
  max_file_size_mb INTEGER,
  has_advanced_ai BOOLEAN DEFAULT FALSE,
  has_priority_support BOOLEAN DEFAULT FALSE,
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE
);

-- إدراج خطط الاشتراك الأساسية
INSERT INTO public.subscription_plans (name, price_monthly, max_messages_per_day, max_projects, max_file_size_mb, has_advanced_ai, features)
VALUES 
  ('free', 0, 50, 3, 5, FALSE, '{"chat": true, "basic_ai": true}'::JSONB),
  ('pro', 9.99, 500, 50, 50, TRUE, '{"chat": true, "advanced_ai": true, "projects": true, "tasks": true}'::JSONB),
  ('enterprise', 49.99, 5000, 500, 200, TRUE, '{"chat": true, "advanced_ai": true, "projects": true, "tasks": true, "team_collab": true, "analytics": true}'::JSONB)
ON CONFLICT (name) DO NOTHING;

-- الفهارس
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY user_activity_select_own ON public.user_activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_activity_insert_own ON public.user_activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_sessions_select_own ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_sessions_insert_own ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_sessions_delete_own ON public.user_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY notifications_select_own ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- دوال مساعدة
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users 
  SET total_messages = (
    SELECT COUNT(*) FROM public.messages 
    WHERE user_id = NEW.user_id
  ),
  total_conversations = (
    SELECT COUNT(*) FROM public.conversations 
    WHERE user_id = NEW.user_id
  ),
  last_seen = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger لتحديث إحصائيات المستخدم
DROP TRIGGER IF EXISTS update_user_stats_trigger ON public.messages;
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();
