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
    setLocalUser(user: LocalUserInterface) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    session = signal<Session | null>(null);

    async login({ email, password }: LoginInterface): Promise<void> {
        const response: AuthResponse = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (response.error) throw response.error;

        if (!response.data.session || !response.data.user) {
            return;
        }

        const user: LocalUserInterface = {
            id: response.data.user.id,
            email: response.data.session.user.email,
            nombre: response.data.session.user.user_metadata['nombre'],
        };

        this.setLocalUser(user);
        this.session.set(response.data.session);
    }
}
