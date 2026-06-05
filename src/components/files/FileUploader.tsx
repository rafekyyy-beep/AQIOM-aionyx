'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';

interface FileUploaderProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string[];
  maxSize?: number;
}

export function FileUploader({ onUpload, accept = ['image/*', 'application/pdf'], maxSize = 10 * 1024 * 1024 }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.size <= maxSize) {
      setSelectedFile(file);
    }
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept });

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    await onUpload(selectedFile);
    setUploading(false);
    setSelectedFile(null);
    setProgress(0);
  };

  return (
    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500" />
        {isDragActive ? (
          <p>أفلت الملف هنا...</p>
        ) : (
          <p>اسحب وأفلت الملف هنا أو انقر للاختيار</p>
        )}
        <p className="text-xs text-gray-500 mt-2">الحد الأقصى: 10MB</p>
      </div>

      {selectedFile && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="w-4 h-4" />
            <span className="text-sm">{selectedFile.name}</span>
          </div>
          <button onClick={() => setSelectedFile(null)}>
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {uploading && <Progress value={progress} className="mt-4" />}

      {selectedFile && !uploading && (
        <Button onClick={handleUpload} className="mt-4">رفع الملف</Button>
      )}
    </div>
  );
}
