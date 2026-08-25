import { App } from '@capacitor/app';
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

// En Capacitor, el refresh automático del token debe pausarse cuando la app
// pasa a segundo plano (evita refrescos innecesarios/errores de red) y
// retomarse al volver a primer plano, para que la sesión no quede vencida.
App.addListener('appStateChange', ({ isActive }) => {
  if (isActive) {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});