import { createClient } from '@/lib/supabase/client';

export class StorageService {
  private supabase = createClient();

  async upload(file: File, path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('files')
      .upload(path, file);

    if (error) throw error;
    return data.path;
  }

  async download(path: string): Promise<Blob> {
    const { data, error } = await this.supabase.storage
      .from('files')
      .download(path);

    if (error) throw error;
    return data;
  }

  async delete(path: string): Promise<void> {
    await this.supabase.storage.from('files').remove([path]);
  }

  getPublicUrl(path: string): string {
    return this.supabase.storage.from('files').getPublicUrl(path).data.publicUrl;
  }
}

export const storageService = new StorageService();
