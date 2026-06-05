export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  avatarUrl: string | null;
  plan: 'free' | 'pro';
  isIslamicMode: boolean;
  language: 'ar' | 'en';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  notifications: boolean;
  autoSaveMemories: boolean;
}
