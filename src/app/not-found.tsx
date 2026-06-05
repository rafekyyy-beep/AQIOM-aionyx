import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <h2 className="text-2xl font-semibold">الصفحة غير موجودة</h2>
        <p className="text-gray-400">عذراً، الصفحة التي تبحث عنها غير متوفرة</p>
        <Link href="/">
          <Button>العودة إلى الرئيسية</Button>
        </Link>
      </div>
    </div>
  );
}
