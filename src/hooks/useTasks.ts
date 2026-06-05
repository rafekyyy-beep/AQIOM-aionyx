import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  project_id: string | null;
  created_at: string;
}

export function useTasks(projectId?: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('tasks').select('*');
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTasks(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }, [projectId, supabase]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'created_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({ ...task, project_id: projectId || null })
        .select()
        .single();

      if (insertError) throw insertError;
      
      setTasks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      return null;
    }
  }, [projectId, supabase]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      setTasks(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      return null;
    }
  }, [supabase]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setTasks(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      return false;
    }
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, fetchTasks, addTask, updateTask, deleteTask };
                                     }
