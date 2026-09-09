import { inject, Service, signal } from '@angular/core';
import { AuthResponse, Session } from '@supabase/supabase-js';
import { LoginInterface, LocalUserInterface, PerfilUsuario } from '../interfaces/auth.interface';
import { AnonimoAltaInterface } from '../interfaces/cliente.interface';
import { supabase } from './supabase.service';
import { GaleriaService } from './galeria.service';
import { ModalService } from './modal.service';

@Service()
export class AuthService {
    // Única fuente de verdad para la sesión: se actualiza sola ante login,
    // logout, refresh de token o expiración, sin importar quién lo dispare.
    session = signal<Session | null>(null);

    // El rol no viene en la sesión de Auth: hay que pedirlo aparte a "usuarios".
    // Se resuelve solo cada vez que cambia la sesión (login/logout/refresh).
    perfil = signal<PerfilUsuario | null>(null);

    // Motivo por el que no se pudo leer el perfil, cuando la consulta falló.
    // En null significa que la consulta anduvo (haya traído fila o no).
    perfilError = signal<string | null>(null);

    // Datos de identidad para la cabecera: nombre y foto de la persona que
    // está usando la aplicación. Vienen de la misma consulta que el perfil, así
    // que no agregan un viaje extra a la base.
    nombres = signal<string | null>(null);
    apellidos = signal<string | null>(null);
    fotoUrl = signal<string | null>(null);

    galeriaService = inject(GaleriaService)
    modal = inject(ModalService)

    constructor() {
        supabase.auth.onAuthStateChange((_event, session) => {
            this.session.set(session);

            if (session?.user) {
                this.cargarPerfil(session.user.id);
            } else {
                this.perfil.set(null);
                this.limpiarIdentidad();
                this.limpiarIdentidad();
            }
        });
    }

    // Pública porque los altas (registro e ingreso anónimo) tienen que pedirla
    // a mano: la sesión se abre un instante antes de que exista la fila en
    // `usuarios`, así que el listener de arriba llega demasiado temprano.
    async cargarPerfil(userId: string) {
        // `maybeSingle` y no `single`: que el usuario todavía no tenga fila es
        // un caso previsto (durante el alta la sesión se abre un instante
        // antes de insertarla), y `single` lo trata como error devolviendo un
        // 406 que ensucia la consola sin aportar nada.
        const { data, error } = await supabase
            .from('usuarios')
            .select('perfil, nombres, apellidos, foto_url')
            .select('perfil, nombres, apellidos, foto_url')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            // La consulta falló: no es que falte la fila. Se guarda el motivo
            // para que la pantalla no mande a revisar la base cuando en
            // realidad fue la red, los permisos o el token.
            // La consulta falló: no es que falte la fila. Se guarda el motivo
            // para que la pantalla no mande a revisar la base cuando en
            // realidad fue la red, los permisos o el token.
            console.error('No se pudo cargar el perfil del usuario', userId, error);

            this.perfilError.set(error.message);
            this.perfilError.set(error.message);
            this.perfil.set(null);
            this.limpiarIdentidad();
            this.limpiarIdentidad();
            return;
        }

        if (!data) {
            // Existe en auth.users pero no en `usuarios`. Pasa con cuentas
            // creadas a mano desde el Dashboard, y con las que quedaron
            // huérfanas si se volvió a correr sql/usuarios.sql (ese script
            // recrea la tabla y sólo repone los usuarios de prueba).
            console.warn('El usuario no tiene fila en "usuarios"', userId);

            this.perfilError.set(null);
            this.perfilError.set(null);
            this.perfil.set(null);
            this.limpiarIdentidad();
            this.limpiarIdentidad();
            return;
        }

        this.perfilError.set(null);
        this.perfilError.set(null);
        this.perfil.set(data.perfil);

        this.nombres.set(data.nombres ?? null);
        this.apellidos.set(data.apellidos ?? null);
        this.fotoUrl.set(data.foto_url ?? null);
    }

    /** Deja la identidad en blanco cuando no hay fila que mostrar. */
    private limpiarIdentidad() {
        this.nombres.set(null);
        this.apellidos.set(null);
        this.fotoUrl.set(null);

        this.nombres.set(data.nombres ?? null);
        this.apellidos.set(data.apellidos ?? null);
        this.fotoUrl.set(data.foto_url ?? null);
    }

    /** Deja la identidad en blanco cuando no hay fila que mostrar. */
    private limpiarIdentidad() {
        this.nombres.set(null);
        this.apellidos.set(null);
        this.fotoUrl.set(null);
    }

    setLocalUser(user: LocalUserInterface) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    async login({ email, password }: LoginInterface): Promise<void> {
        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

        const response: AuthResponse = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (response.error) throw response.error;

        if (!response.data.session || !response.data.user) {
            throw new Error('No se pudo iniciar sesión. Verifique sus credenciales.');
        }

        await delay(1500);

        await delay(1500);

        // Punto 5 del enunciado: el cliente registrado no puede ingresar hasta
        // que un dueño o supervisor apruebe su solicitud. Se cierra la sesion
        // recien abierta para que no quede una sesion valida a medias.
        const { data: fila } = await supabase
            .from('usuarios')
            .select('estado')
            .eq('id', response.data.user.id)
            .single();

        if (fila && fila.estado !== 'Activo') {
            await supabase.auth.signOut();

            throw new Error(
                fila.estado === 'Rechazado'
                    ? 'Su solicitud de registro fue rechazada. No puede ingresar a la aplicación.'
                    : 'Su registro todavía está pendiente de aprobación. Aguarde el correo de confirmación.'
            );
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

    /**
     * Ingreso de cliente anónimo (punto 9 del enunciado).
     *
     * `signInAnonymously()` crea un usuario real en auth.users (sin mail ni
     * contraseña) y abre una sesión como cualquier otra: se persiste sola en
     * Capacitor Preferences y se renueva sola. Por eso el cliente puede cerrar
     * la app en medio de la comida y al volver sigue con su mesa y su pedido.
     *
     * El perfil va a `usuarios` como el de cualquier otro rol, así que los
     * guards, `perfil()` y los botones del home funcionan sin nada especial.
     */
    async ingresarComoAnonimo({ nombres, foto }: AnonimoAltaInterface): Promise<void> {
        const { data, error } = await supabase.auth.signInAnonymously();

        if (error) throw error;

        if (!data.user) {
            throw new Error('No se pudo iniciar la sesión de invitado.');
        }

        try {
            // La cámara entrega un Blob y `subirImagen` espera un File.
            const archivo = new File([foto], `anonimo_${data.user.id}.jpg`, {
                type: foto.type || 'image/jpeg',
            });

            const fotoUrl = await this.galeriaService.subirImagenDb(archivo, 'usuarios');

            const { error: errorPerfil } = await supabase.from('usuarios').insert({
                id: data.user.id,
                nombres,
                foto_url: fotoUrl,
                perfil: 'cliente anónimo',
                estado: 'Activo', // No requiere aprobación, a diferencia del punto 5.
            });

            if (errorPerfil) throw errorPerfil;
        } catch (error) {
            // Sin fila en `usuarios` la sesión no sirve para nada y dejaría un
            // usuario huérfano en Auth: se cierra para poder reintentar limpio.
            await supabase.auth.signOut();

            throw error;
        }

        // El listener de onAuthStateChange corrió antes de que existiera la
        // fila, así que el perfil se pide ahora.
        await this.cargarPerfil(data.user.id);
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

            const publicUrl = await this.galeriaService.subirImagenDb(fotoArchivo, 'usuarios');

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
                const { error } = await supabase.from('usuarios').insert({
                    id: data.user.id,
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
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo crear el usuario.';
            this.modal.setOpen('Error', mensaje);
        } finally {
            // signUp() deja la sesión abierta, pero un registro nuevo queda en
            // estado 'Pendiente' hasta que un dueño o supervisor lo apruebe:
            // no tiene que quedar logueado. Va en el finally para que tampoco
            // quede una sesión a medias si el alta falla por el camino.
            await supabase.auth.signOut();
            localStorage.removeItem('user');
        }
    }
}
