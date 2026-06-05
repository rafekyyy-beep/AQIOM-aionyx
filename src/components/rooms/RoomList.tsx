'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Hash, Users, Lock, Plus, MessageCircle } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string | null;
  type: 'public' | 'private' | 'team';
  member_count: number;
  created_at: string;
}

interface RoomListProps {
  onSelectRoom: (roomId: string) => void;
  selectedRoomId?: string;
}

export function RoomList({ onSelectRoom, selectedRoomId }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomType, setNewRoomType] = useState<'public' | 'private'>('public');
  const supabase = createClient();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    setRooms(data || []);
    setLoading(false);
  };

  const createRoom = async () => {
    if (!newRoomName) return;

    const { data } = await supabase
      .from('rooms')
      .insert({
        name: newRoomName,
        type: newRoomType,
      })
      .select()
      .single();

    if (data) {
      // إضافة المنشئ كعضو
      await supabase.from('room_members').insert({
        room_id: data.id,
        role: 'admin',
      });
      
      setRooms([data, ...rooms]);
    }

    setNewRoomName('');
    setIsModalOpen(false);
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case 'private': return <Lock className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <Button onClick={() => setIsModalOpen(true)} className="w-full">
          <Plus className="w-4 h-4 ml-2" />
          غرفة جديدة
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1">
        {loading ? (
          <div className="text-center py-8 text-gray-400">جاري التحميل...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">لا توجد غرف</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedRoomId === room.id
                  ? 'bg-primary-600'
                  : 'hover:bg-border'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {getRoomIcon(room.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{room.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Users className="w-3 h-3" />
                    <span>{room.member_count}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="غرفة جديدة">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="اسم الغرفة"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="w-full p-3 bg-background rounded-lg border border-border"
          />
          <select
            value={newRoomType}
            onChange={(e) => setNewRoomType(e.target.value as any)}
            className="w-full p-3 bg-background rounded-lg border border-border"
          >
            <option value="public">عامة</option>
            <option value="private">خاصة</option>
          </select>
          <div className="flex gap-3">
            <Button onClick={createRoom}>إنشاء</Button>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
