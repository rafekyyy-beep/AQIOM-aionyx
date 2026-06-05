-- إضافة عمود role إلى جدول users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- تعيين أدمن افتراضي (اختياري - غيّر البريد)
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@aqiom.com';

-- إضافة فهرس على role لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- إضافة سياسة RLS للوصول إلى role
-- المستخدم العادي يرى فقط role الخاص به
CREATE POLICY users_select_role ON public.users 
  FOR SELECT USING (auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- إشعار التثبيت
DO $$
BEGIN
  RAISE NOTICE '✅ عمود role تمت إضافته بنجاح';
  RAISE NOTICE '⚠️ تذكر: قم بتعيين role="admin" للمستخدمين الذين تريد منحهم صلاحيات إدارية';
END $$;
