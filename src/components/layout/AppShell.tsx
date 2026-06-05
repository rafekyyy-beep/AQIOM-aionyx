'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:mr-80 h-screen">
        {children}
      </main>
    </div>
  );
}
