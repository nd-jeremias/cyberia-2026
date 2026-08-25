import { Service, signal } from '@angular/core';
import { AuthResponse, Session } from '@supabase/supabase-js';
import {
    LoginInterface,
    RegisterInterface,
    LocalUserInterface,
} from '../interfaces/auth.interface';
import { supabase } from './supabase.service';

@Service()
export class AuthService {
    // Única fuente de verdad para la sesión: se actualiza sola ante login,
    // logout, refresh de token o expiración, sin importar quién lo dispare.
    session = signal<Session | null>(null);

    constructor() {
        supabase.auth.onAuthStateChange((_event, session) => {
            this.session.set(session);
        });
    }

    setLocalUser(user: LocalUserInterface) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    async login({ email, password }: LoginInterface): Promise<void> {
        const response: AuthResponse = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (response.error) throw response.error;

        if (!response.data.session || !response.data.user) {
            throw new Error('No se pudo iniciar sesión. Verifique sus credenciales.');
        }

        const user: LocalUserInterface = {
            id: response.data.user.id,
            email: response.data.session.user.email,
            nombre: response.data.session.user.user_metadata['nombre'],
        };

        this.setLocalUser(user);
    }

    // Espera a que el cliente de Supabase termine de leer la sesión persistida
    // (Capacitor Preferences) y la devuelve. Usado por los guards de rutas.
    async restoreSession(): Promise<Session | null> {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        return data.session;
    }

    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        localStorage.removeItem('user');
    }
}
