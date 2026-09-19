import { Service, computed, inject, signal } from '@angular/core';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { Platform, ToastController } from '@ionic/angular';
import { NotificacionInterface, TipoNotificacion } from '../interfaces/notificacion.interface';
import { ModalService } from './modal.service';
import { supabase } from './supabase.service';
import { VibracionService } from './vibracion.service';

const CLAVE_TOKEN = 'token-push';

// Android 8+ ignora sonido y prioridad si la notificacion no pertenece a un
// canal declarado, por eso se crea uno propio al inicializar.
const CANAL_AVISOS = 'avisos-cyberia';

/**
 * Notificaciones push.
 *
 * El servicio tiene dos vidas distintas, y confundirlas era la causa de que el
 * `token_push` no se renovara:
 *
 *   - El REGISTRO DEL DISPOSITIVO (permiso, canal, listeners y el token que
 *     entrega Firebase) dura lo que dura la aplicación abierta. El token es del
 *     teléfono, no de la persona: no cambia porque alguien cierre sesión.
 *   - El VÍNCULO TOKEN↔USUARIO (la columna `usuarios.token_push`) dura lo que
 *     dura la sesión: se escribe al entrar y se borra al salir.
 *
 * Antes `cerrarSesion()` desarmaba también lo primero (`removeAllListeners()` y
 * `unregister()`) sin bajar la bandera `inicializado`, y `inicializar()` sólo
 * corría una vez, en el arranque. Resultado: después del primer logout no
 * volvía a llegar ningún evento `registration` en toda la vida del proceso, el
 * token local quedaba borrado y el usuario siguiente se quedaba con
 * `token_push` en NULL hasta cerrar y reabrir la aplicación por completo.
 */
@Service()
export class NotificacionesService {
    private platform = inject(Platform);
    private modal = inject(ModalService);
    private toastCtrl = inject(ToastController);
    private vibracion = inject(VibracionService);

    /** Evita registrar los listeners dos veces si se inicializa de nuevo. */
    private inicializado = false;

    /**
     * Inicialización en curso.
     *
     * `inicializar()` se llama desde el arranque y otra vez al iniciar sesión;
     * sin esto, dos llamadas simultáneas pasarían las dos por el `if` inicial
     * (la bandera se levanta recién después del `await` del permiso) y se
     * duplicarían los listeners.
     */
    private inicializacion: Promise<void> | null = null;

    token = signal<string | null>(null);
    permisoConcedido = signal<boolean>(false);
    notificaciones = signal<NotificacionInterface[]>([]);

    sinLeer = computed(() => this.notificaciones().filter((n) => !n.leida).length);

    // En el navegador el plugin nativo no existe, asi que las pantallas
    // deben poder seguir funcionando sin notificaciones.
    private get esNativo(): boolean {
        return this.platform.is('capacitor');
    }

    constructor() {
        this.sincronizarAlCambiarSesion();
    }

    async inicializar(): Promise<void> {
        if (!this.esNativo || this.inicializado) return;

        // Si ya hay una inicialización en vuelo, se espera a esa.
        this.inicializacion ??= this.inicializarUnaVez();

        try {
            await this.inicializacion;
        } finally {
            this.inicializacion = null;
        }
    }

    private async inicializarUnaVez(): Promise<void> {
        const permiso = await this.pedirPermiso();

        if (!permiso) return;

        // Se levanta ANTES de registrar los listeners: a partir de acá el
        // servicio queda armado y nadie más tiene que volver a armarlo.
        this.inicializado = true;

        await this.crearCanal();

        this.escucharEventos();

        await PushNotifications.register();
    }

    /**
     * Mantiene `usuarios.token_push` al día durante toda la sesión.
     *
     * El token puede llegar antes de que Supabase termine de leer la sesión
     * guardada en el dispositivo: en ese caso `sincronizarToken` no encuentra
     * usuario y no guarda nada. Escuchar los cambios de sesión cubre ese caso y
     * también el ingreso anónimo y el de los botones rápidos, que no pasan por
     * la pantalla de ingreso.
     *
     * Se suscribe en el constructor y no dentro de `inicializar()`: la
     * suscripción no depende del permiso de notificaciones ni de estar en un
     * dispositivo, y si el permiso se concede más tarde el token igual queda
     * asociado al usuario que esté en sesión.
     */
    private sincronizarAlCambiarSesion(): void {
        supabase.auth.onAuthStateChange((evento, sesion) => {
            if (!sesion) return;

            // Supabase advierte que llamar a otros métodos suyos dentro de este
            // callback puede trabar el cliente: se difiere al siguiente ciclo.
            if (evento === 'SIGNED_IN' || evento === 'INITIAL_SESSION' || evento === 'TOKEN_REFRESHED') {
                setTimeout(() => void this.sincronizarToken(), 0);
            }
        });
    }

    private async crearCanal(): Promise<void> {
        if (!this.platform.is('android')) return;

        await PushNotifications.createChannel({
            id: CANAL_AVISOS,
            name: 'Avisos del restaurante',
            description: 'Pedidos, mesas, consultas y aprobaciones de clientes.',
            importance: 5,
            visibility: 1,
            sound: 'default',
            vibration: true,
            lights: true,
        });
    }

    private async pedirPermiso(): Promise<boolean> {
        let estado = await PushNotifications.checkPermissions();

        if (estado.receive === 'prompt') {
            estado = await PushNotifications.requestPermissions();
        }

        const concedido = estado.receive === 'granted';

        this.permisoConcedido.set(concedido);

        if (!concedido) {
            this.modal.setOpen(
                'Notificaciones desactivadas',
                'Habilite las notificaciones desde la configuración del dispositivo para recibir avisos.'
            );
        }

        return concedido;
    }

    private escucharEventos(): void {
        PushNotifications.addListener('registration', async (token: Token) => {
            this.token.set(token.value);
            await Preferences.set({ key: CLAVE_TOKEN, value: token.value });

            // Si el usuario ya inicio sesion, el backend necesita el token
            // para poder dirigirle los avisos a este dispositivo.
            await this.sincronizarToken();
        });

        // La vibración la pone el modal, que vibra ante cualquier error.
        PushNotifications.addListener('registrationError', () => {
            this.modal.setOpen('Error de registro', 'No se pudo registrar el dispositivo para recibir notificaciones.');
        });

        // Con la app en primer plano Android no dibuja nada en la barra:
        // entrega el aviso y la app decide como mostrarlo.
        PushNotifications.addListener('pushNotificationReceived', async (notificacion: PushNotificationSchema) => {
            const nueva = this.agregar(notificacion);
            await this.avisarEnPantalla(nueva);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (accion: ActionPerformed) => {
            const nueva = this.agregar(accion.notification);
            this.marcarLeida(nueva.id);
        });
    }

    private async avisarEnPantalla(notificacion: NotificacionInterface): Promise<void> {
        await this.vibracion.exito();

        const toast = await this.toastCtrl.create({
            header: notificacion.titulo,
            message: notificacion.cuerpo,
            duration: 5000,
            position: 'top',
            color: 'primary',
            buttons: [{ text: 'Cerrar', role: 'cancel' }],
        });

        await toast.present();
    }

    private agregar(origen: PushNotificationSchema): NotificacionInterface {
        const datos = (origen.data ?? {}) as Record<string, unknown>;
        const tipo = datos['tipo'];

        const nueva: NotificacionInterface = {
            id: origen.id || crypto.randomUUID(),
            titulo: origen.title ?? 'Aviso',
            cuerpo: origen.body ?? '',
            tipo: typeof tipo === 'string' ? (tipo as TipoNotificacion) : null,
            datos,
            fecha: new Date().toISOString(),
            leida: false,
        };

        this.notificaciones.update((actuales) => [nueva, ...actuales]);

        return nueva;
    }

    marcarLeida(id: string): void {
        this.notificaciones.update((actuales) => actuales.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    }

    marcarTodasLeidas(): void {
        this.notificaciones.update((actuales) => actuales.map((n) => ({ ...n, leida: true })));
    }

    async limpiar(): Promise<void> {
        this.notificaciones.set([]);

        if (this.esNativo) {
            await PushNotifications.removeAllDeliveredNotifications();
        }
    }

    // --- Ciclo de sesión ------------------------------------------------------

    /**
     * Deja el dispositivo listo y asociado al usuario que acaba de entrar.
     *
     * Se llama desde TODAS las puertas de entrada (ingreso con credenciales,
     * ingreso anónimo y accesos rápidos). Es idempotente: si el servicio ya
     * estaba armado sólo vuelve a pedirle el token a Firebase, lo que dispara de
     * nuevo el evento `registration` y, con él, la escritura en la base.
     */
    async alIniciarSesion(): Promise<void> {
        const yaEstabaArmado = this.inicializado;

        await this.inicializar();

        // Si el servicio ya venía armado —caso típico: segundo ingreso sin
        // cerrar la aplicación—, `inicializar()` no hizo nada y hay que volver
        // a pedirle el token a Firebase. Eso emite `registration` de nuevo y,
        // con él, la escritura en la base. En el primer ingreso no hace falta:
        // `inicializar()` ya llamó a `register()`.
        if (yaEstabaArmado && this.esNativo) {
            try {
                await PushNotifications.register();
            } catch (error) {
                console.error('No se pudo volver a registrar el dispositivo', error);
            }
        }

        await this.sincronizarToken();
    }

    /**
     * Desvincula el dispositivo del usuario que se va.
     *
     * Sólo se corta el VÍNCULO: se pone `token_push` en NULL y se vacía la
     * bandeja. Los listeners y el token del dispositivo se conservan a
     * propósito, porque son del teléfono y no de la persona; tirarlos abajo era
     * justamente lo que dejaba sin avisos al usuario siguiente.
     *
     * Debe llamarse ANTES de cerrar la sesión de Supabase: sin sesión ya no se
     * puede escribir la fila del usuario que se está yendo.
     */
    async cerrarSesion(): Promise<void> {
        await this.olvidarTokenEnBase();

        this.notificaciones.set([]);

        if (this.esNativo) {
            await PushNotifications.removeAllDeliveredNotifications();
        }
    }

    // Guarda el token en la fila del usuario logueado. Se llama al recibir el
    // token y tambien despues del login, porque el orden entre ambos no esta
    // garantizado: el registro puede resolverse antes de que exista sesion.
    async sincronizarToken(): Promise<void> {
        try {
            const token = await this.recuperarToken();
            if (!token) return;

            const { data, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            const usuarioId = data.session?.user.id;
            if (!usuarioId) return;

            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ token_push: token })
                .eq('id', usuarioId);

            if (updateError) throw updateError;
        } catch (error) {
            // Capturamos cualquier error (de sesión, de la query o del método recuperarToken)
            console.error('No se pudo guardar o sincronizar el token push:', error);
        }
    }

    async recuperarToken(): Promise<string | null> {
        if (this.token()) return this.token();

        const { value } = await Preferences.get({ key: CLAVE_TOKEN });

        this.token.set(value);

        return value;
    }

    private async olvidarTokenEnBase(): Promise<void> {
        try {
            const { data, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            const usuarioId = data.session?.user.id;
            if (!usuarioId) return;

            // Ejecutamos la consulta guardando la respuesta para evaluar errores
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ token_push: null })
                .eq('id', usuarioId);

            if (updateError) throw updateError;
        } catch (error) {
            // Captura el error en la consola para debugging, pero no lo relanza (no usa throw)
            // para que el proceso de cerrar sesión local de la app pueda continuar con éxito.
            console.error('Error al intentar limpiar el token_push en la base de datos:', error);
        }
    }

    // Método para notificar a varios perfiles (ej: ['dueño', 'supervisor', 'barman'])
    async enviarAvisos(perfiles: string[], titulo: string, cuerpo: string, tipo: string) {
        try {
            // 1. Buscamos TODOS los usuarios que coincidan con CUALQUIERA de los perfiles.
            // Al usar .in() no hace falta un bucle "for", Supabase trae todos juntos.
            const { data: usuarios, error: userError } = await supabase
                .from('usuarios')
                .select('token_push')
                .in('perfil', perfiles) // Busca múltiples perfiles a la vez!
                .eq('estado', 'Activo')
                .not('token_push', 'is', null); // Evitamos traer a los que no tienen su celu registrado

            if (userError) throw userError;

            // Extraemos solo los valores de push (ignoramos los nulos por precaución)
            const tokens = usuarios?.map((u) => u.token_push).filter((t) => !!t) || [];

            if (tokens.length === 0) {
                // console.log('No hay usuarios activos con esos perfiles listos para recibir avisos.');
                console.log('No se encontraron los tokens para enviar las notificaciones.')
                return;
            }

            // 2. Invocamos la Edge Function UNA SOLA VEZ pasando toda la lista de tokens juntos.
            // La función de Supabase se encarga internamente de enviar todos los mensajes sin saturar la app.
            const { data, error } = await supabase.functions.invoke('enviar-notificacion', {
                body: {
                    tokens: tokens, // ¡Le pasamos el arreglo gigante de corrido!
                    titulo: titulo,
                    cuerpo: cuerpo,
                    tipo: tipo,
                },
            });

            if (error) throw error;

            console.log(`Se enviaron notificaciones a ${tokens.length} dispositivos exitosamente:`, data);
            return data;
        } catch (error) {
            console.error('Error al intentar enviar notificación grupal:', error);
            throw new Error('Error al enviar notificaciones.')
        }
    }

    // Igual que enviarAvisos, pero para UNA persona puntual y no para un perfil.
    // Lo usa el chat (punto 11): la respuesta del mozo le llega sólo al cliente de ese chat.
    async enviarAvisoAUsuario(usuarioId: string, titulo: string, cuerpo: string, tipo: string) {
        try {
            const { data: usuario, error: userError } = await supabase
                .from('usuarios')
                .select('token_push')
                .eq('id', usuarioId)
                .maybeSingle();

            if (userError) throw userError;

            if (!usuario?.token_push) {
                console.log('El usuario no tiene el celular registrado para recibir avisos.');
                return;
            }

            const { data, error } = await supabase.functions.invoke('enviar-notificacion', {
                body: {
                    tokens: [usuario.token_push],
                    titulo: titulo,
                    cuerpo: cuerpo,
                    tipo: tipo,
                },
            });

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error al intentar enviar la notificación al usuario:', error);
            throw new Error('Error al enviar la notificación.');
        }
    }
}
