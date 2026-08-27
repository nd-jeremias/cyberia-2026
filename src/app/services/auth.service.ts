import { Service, signal } from '@angular/core';
import { AuthResponse, Session } from '@supabase/supabase-js';
import { LoginInterface, RegisterInterface, LocalUserInterface } from '../interfaces/auth.interface';
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
            correo: response.data.session.user.email,
            nombres: response.data.session.user.user_metadata['nombre'],
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

    async register(form: FormData): Promise<void> {
        try {
            const correo = form.get('correo') as string;
            const password = form.get('password') as string;
            const dni = form.get('dni') as string;
            const nombres = form.get('nombres') as string;
            const apellidos = form.get('apellidos') as string;
            const cuil = form.get('cuil') as string;
            const tipoEmpleado = form.get('tipoEmpleado') as string;
            const fotoArchivo = form.get('foto') as File;

            const publicUrl = await this.subirImagen(fotoArchivo);

            if (!publicUrl) throw Error;

            // Normalizacion de datos
            const correoRaw = form.get('correo') as string;
            const correolimpio = correoRaw.replace(/["']/g, '').trim().toLowerCase();

            const perfilFinal = tipoEmpleado && tipoEmpleado.trim() !== '' ? tipoEmpleado : 'cliente registrado';

            const { data, error } = await supabase.auth.signUp({
                email: correo,
                password,
                options: {
                    // Metadatos que van directamente al usuario de Auth (Opcional)
                    data: { nombres, apellidos },
                },
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                const user: LocalUserInterface = {
                    id: data.user.id,
                    correo,
                    nombres,
                };
                this.setLocalUser(user);

                const { error } = await supabase.from('usuarios').insert({
                    id: user.id,
                    nombres,
                    apellidos,
                    dni,
                    cuil,
                    correo_electronico: correo,
                    foto_url: publicUrl,
                    perfil: perfilFinal,
                    estado: tipoEmpleado ? 'Activo' : 'Pendiente',
                });

                if (error) throw error;
            }
            // return session <==
        } catch (error) {
            throw error;
        }
    }

    async subirImagen(fotoArchivo: File): Promise<string> {
        const rutaArchivo = `usuarios/${fotoArchivo.name}`;

        const { data: storageData, error: storageError } = await supabase.storage
            .from('Fotos')
            .upload(rutaArchivo, fotoArchivo, { cacheControl: '3600', upsert: false });

        if (storageError) throw storageError;

        // Obtener la URL pública del archivo subido
        const { data: urlData } = supabase.storage.from('Fotos').getPublicUrl(rutaArchivo);

        return urlData.publicUrl;
    }
}
