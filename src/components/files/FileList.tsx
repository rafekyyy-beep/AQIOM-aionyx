'use client';

import { FileText, Image, File, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/helpers';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface FileListProps {
  files: FileItem[];
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
};

export function FileList({ files, onDelete, onDownload }: FileListProps) {
  if (files.length === 0) {
    return <p className="text-center text-gray-500 py-8">لا توجد ملفات</p>;
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
          <div className="flex items-center gap-3">
            {getFileIcon(file.type)}
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{formatDate(file.uploadedAt)} - {(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onDownload && (
              <button onClick={() => onDownload(file.id)} className="p-1 hover:bg-gray-800 rounded">
                <Download className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(file.id)} className="p-1 hover:bg-gray-800 rounded text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
