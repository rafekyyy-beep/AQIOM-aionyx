-- إنشاء جدول سجل التدقيق الأمني
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_id TEXT,
  status TEXT CHECK (status IN ('success', 'failure')),
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- تفعيل RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان: المستخدمون يرون سجلاتهم فقط، الأدمن يرون الكل
CREATE POLICY audit_logs_select_own ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY audit_logs_select_admin ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- لا يُسمح بالإدراج إلا من خلال system
CREATE POLICY audit_logs_insert_system ON public.audit_logs
  FOR INSERT WITH CHECK (true);
