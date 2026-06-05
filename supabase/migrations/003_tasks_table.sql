-- إنشاء جدول المهام
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء الفهارس
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);

-- تفعيل RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY tasks_select_own ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY tasks_insert_own ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY tasks_update_own ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY tasks_delete_own ON public.tasks FOR DELETE USING (auth.uid() = user_id);
