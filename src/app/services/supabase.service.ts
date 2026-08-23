import { Preferences } from '@capacitor/preferences';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uwmptccyleznngdazgrp.supabase.co/';
const supabaseKey = 'sb_publishable_Rergl078Rb0RVfq5uNPlIw_byzVZGEK';

// Adaptador para que Supabase entienda a Capacitor Preferences
const supabaseAuthStorage = {
  getItem: async (key: string) => {
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string) => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string) => {
    await Preferences.remove({ key });
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: supabaseAuthStorage,
    persistSession: true, 
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});