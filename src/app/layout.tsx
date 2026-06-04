import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AQIOM - AI Assistant',
  description: 'AI chat application with PWA support',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-background text-white">{children}</body>
    </html>
  );
}
