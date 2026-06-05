'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FolderPlus, Folder, MoreVertical } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    setProjects(data || []);
    setLoading(false);
  };

  const createProject = async () => {
    if (!newTitle) return;

    await supabase.from('projects').insert({
      title: newTitle,
      description: newDescription,
    });

    setNewTitle('');
    setNewDescription('');
    setIsModalOpen(false);
    fetchProjects();
  };

  return (
    <AppShell>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">المشاريع</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <FolderPlus className="w-4 h-4 ml-2" />
            مشروع جديد
          </Button>
        </div>

        {loading ? (
          <p className="text-gray-400">جاري التحميل...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Folder className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>لا توجد مشاريع</p>
            <Button variant="ghost" onClick={() => setIsModalOpen(true)} className="mt-4">
              أنشئ أول مشروع لك
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    {project.description && (
                      <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(project.created_at).toLocaleDateString('ar')}
                    </p>
                  </div>
                  <button className="p-1 hover:bg-border rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="مشروع جديد">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="اسم المشروع"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-3 bg-background rounded-lg border border-border"
            />
            <textarea
              placeholder="وصف المشروع (اختياري)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-3 bg-background rounded-lg border border-border resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <Button onClick={createProject}>إنشاء</Button>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
