'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { RoomList } from '@/components/rooms/RoomList';
import { RoomChat } from '@/components/rooms/RoomChat';
import { useAuth } from '@/hooks/useAuth';

export default function RoomsPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="flex h-full">
        {/* قائمة الغرف - عرض جانبي */}
        <div className="w-80 border-l border-border bg-surface/50 hidden md:block">
          <RoomList onSelectRoom={setSelectedRoomId} selectedRoomId={selectedRoomId || undefined} />
        </div>

        {/* منطقة الشات */}
        <div className="flex-1">
          {selectedRoomId ? (
            <RoomChat roomId={selectedRoomId} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <p>اختر غرفة لبدء المحادثة</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
