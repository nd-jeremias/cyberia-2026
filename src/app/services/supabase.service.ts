import { App } from '@capacitor/app';
import { Preferences } from '@capacitor/preferences';
import { Service } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

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
// Envuelto en try/catch: si el plugin App no está disponible (build nativo
// desactualizado), esto no debe romper el resto de la app.
try {
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
} catch (error) {
  console.error('No se pudo suscribir a appStateChange', error);
}

/**
 * Envoltura inyectable del cliente de Supabase.
 *
 * La constante `supabase` de arriba sigue exportándose para el código que ya
 * la usa, pero los servicios nuevos deberían inyectar esta clase en su lugar.
 *
 * El motivo es la inversión de dependencias: mientras un servicio importe la
 * constante directamente queda atado a una implementación concreta y no se
 * puede probar sin salir a la red. Inyectándola, un test puede reemplazarla
 * por un doble mediante `TestBed.configureTestingModule({ providers: [...] })`.
 */
@Service()
export class SupabaseService {
    /** Cliente real de Supabase. En los tests se sustituye por un doble. */
    readonly cliente: SupabaseClient = supabase;

    /** Atajo al módulo de autenticación, que es lo que más se usa. */
    get auth() {
        return this.cliente.auth;
    }

    /** Atajo a una tabla; equivale a `cliente.from(tabla)`. */
    from(tabla: string) {
        return this.cliente.from(tabla);
    }
}
