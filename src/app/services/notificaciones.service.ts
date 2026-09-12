import { Service, computed, inject, signal } from '@angular/core';
import {
    ActionPerformed,
    PushNotificationSchema,
    PushNotifications,
    Token,
} from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { Platform, ToastController } from '@ionic/angular';
import {
    NotificacionInterface,
    TipoNotificacion,
} from '../interfaces/notificacion.interface';
import { VibracionService } from './vibracion.service';
import { ModalService } from './modal.service';
import { supabase } from './supabase.service';

const CLAVE_TOKEN = 'token-push';

// Android 8+ ignora sonido y prioridad si la notificacion no pertenece a un
// canal declarado, por eso se crea uno propio al inicializar.
const CANAL_AVISOS = 'avisos-cyberia';

@Service()
export class NotificacionesService {
    private platform = inject(Platform);
    private modal = inject(ModalService);
    private vibracion = inject(VibracionService);
    private toastCtrl = inject(ToastController);

    /** Evita registrar los listeners dos veces si se inicializa de nuevo. */
    private inicializado = false;

    token = signal<string | null>(null);
    permisoConcedido = signal<boolean>(false);
    notificaciones = signal<NotificacionInterface[]>([]);

    sinLeer = computed(() => this.notificaciones().filter((n) => !n.leida).length);

    // En el navegador el plugin nativo no existe, asi que las pantallas
    // deben poder seguir funcionando sin notificaciones.
    private get esNativo(): boolean {
        return this.platform.is('capacitor');
    }

    async inicializar(): Promise<void> {
        // Una sola vez: repetirlo duplicaría los listeners y cada aviso se
        // mostraría dos veces.
        if (!this.esNativo || this.inicializado) return;

        const permiso = await this.pedirPermiso();

        if (!permiso) return;

        this.inicializado = true;

        await this.crearCanal();

        this.escucharEventos();
        this.sincronizarAlCambiarSesion();

        await PushNotifications.register();
    }

    /**
     * Vuelve a guardar el token cada vez que se abre o se restaura una sesión.
     *
     * El token puede llegar antes de que Supabase termine de leer la sesión
     * guardada en el dispositivo: en ese caso `sincronizarToken` no encuentra
     * usuario y no guarda nada, y antes no se volvía a intentar. Escuchar los
     * cambios de sesión cubre ese caso y también el ingreso anónimo y el de los
     * botones rápidos, que no pasan por la pantalla de ingreso.
     */
    private sincronizarAlCambiarSesion(): void {
        supabase.auth.onAuthStateChange((_evento, sesion) => {
            // Supabase advierte que llamar a otros métodos suyos dentro de este
            // callback puede trabar el cliente: se difiere al siguiente ciclo.
            if (sesion) setTimeout(() => void this.sincronizarToken(), 0);
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

    async cerrarSesion(): Promise<void> {
        // Se borra el token de la base ANTES de limpiarlo localmente, para que
        // el proximo usuario del dispositivo no reciba avisos ajenos.
        await this.olvidarTokenEnBase();

        this.notificaciones.set([]);
        this.token.set(null);

        await Preferences.remove({ key: CLAVE_TOKEN });

        if (this.esNativo) {
            await PushNotifications.removeAllListeners();
            await PushNotifications.unregister();
        }
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
}
