import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface UserState {
  user: User | null;
  profile: {
    username: string | null;
    avatar_url: string | null;
    plan: 'free' | 'pro';
  } | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserState['profile']) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  clearUser: () => set({ user: null, profile: null }),
}));
