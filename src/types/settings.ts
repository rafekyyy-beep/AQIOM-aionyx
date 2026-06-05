export interface UserSettings {
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  islamicMode: boolean;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface PrivacySettings {
  shareUsageData: boolean;
  shareMemories: boolean;
  publicProfile: boolean;
}
