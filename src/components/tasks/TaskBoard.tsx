'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Plus, GripVertical, CheckCircle, Circle, Clock, Flag } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
}

interface TaskBoardProps {
  projectId?: string;
}

export function TaskBoard({ projectId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const supabase = createClient();

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    let query = supabase.from('tasks').select('*');
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data } = await query.order('created_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  };

  const addTask = async () => {
    if (!newTitle) return;

    const { data } = await supabase
      .from('tasks')
      .insert({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        project_id: projectId || null,
      })
      .select()
      .single();

    if (data) {
      setTasks([data, ...tasks]);
    }

    setNewTitle('');
    setNewDescription('');
    setIsModalOpen(false);
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    await supabase.from('tasks').update({ status }).eq('id', id);
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const columns = [
    { id: 'pending', title: 'قيد الانتظار', icon: Circle },
    { id: 'in_progress', title: 'قيد التنفيذ', icon: Clock },
    { id: 'completed', title: 'مكتمل', icon: CheckCircle },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">المهام</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          مهمة جديدة
        </Button>
      </div>

      {loading ? (
        <p className="text-gray-400">جاري التحميل...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((column) => {
            const Icon = column.icon;
            const columnTasks = tasks.filter(t => t.status === column.id);
            
            return (
              <div key={column.id} className="bg-surface rounded-lg border border-border">
                <div className="p-3 border-b border-border flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <h3 className="font-semibold">{column.title}</h3>
                  <span className="text-xs text-gray-400 bg-background px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="p-3 space-y-2 min-h-[200px]">
                  {columnTasks.map((task) => (
                    <Card key={task.id} className="p-3 cursor-pointer hover:border-primary-500 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const nextStatus = column.id === 'pending' ? 'in_progress' :
                                                  column.id === 'in_progress' ? 'completed' : 'pending';
                                updateTaskStatus(task.id, nextStatus as Task['status']);
                              }}
                              className="mt-1"
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h4>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <Flag className={`w-3 h-3 ${getPriorityColor(task.priority)}`} />
                            <span className="text-xs text-gray-500">
                              {task.due_date ? new Date(task.due_date).toLocaleDateString('ar') : 'بدون موعد'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-400 text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </Card>
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-8">لا توجد مهام</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="مهمة جديدة">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="عنوان المهمة"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-3 bg-background rounded-lg border border-border"
          />
          <textarea
            placeholder="وصف المهمة (اختياري)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full p-3 bg-background rounded-lg border border-border resize-none"
            rows={3}
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as any)}
            className="w-full p-3 bg-background rounded-lg border border-border"
          >
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">عالية</option>
          </select>
          <div className="flex gap-3">
            <Button onClick={addTask}>إضافة</Button>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
                                                 }
