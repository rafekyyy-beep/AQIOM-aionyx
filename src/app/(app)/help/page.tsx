'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Accordion } from '@/components/ui/Accordion';

const faqs = [
  { question: 'ما هو AQIOM؟', answer: 'AQIOM هو مساعد ذكاء اصطناعي متقدم...' },
  { question: 'كيف يمكنني البدء؟', answer: 'يمكنك البدء بإنشاء حساب جديد...' },
  { question: 'هل الخدمة مجانية؟', answer: 'نعم، هناك خطة مجانية مع خيارات مدفوعة...' },
];

export default function HelpPage() {
  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">المساعدة والدعم</h1>
        <Card title="الأسئلة الشائعة">
          <Accordion items={faqs} />
        </Card>
      </div>
    </AppShell>
  );
}
