export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  url: string;
  userId: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  compress?: boolean;
}
