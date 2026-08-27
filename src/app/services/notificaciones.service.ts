import { Service, computed, inject, signal } from '@angular/core';
import {
    ActionPerformed,
    PushNotificationSchema,
    PushNotifications,
    Token,
} from '@capacitor/push-notifications';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { Platform, ToastController } from '@ionic/angular';
import {
    NotificacionInterface,
    TipoNotificacion,
} from '../interfaces/notificacion.interface';
import { ModalService } from './modal.service';

const CLAVE_TOKEN = 'token-push';

// Android 8+ ignora sonido y prioridad si la notificacion no pertenece a un
// canal declarado, por eso se crea uno propio al inicializar.
const CANAL_AVISOS = 'avisos-cyberia';

@Service()
export class NotificacionesService {
    private platform = inject(Platform);
    private modal = inject(ModalService);
    private toastCtrl = inject(ToastController);

    token = signal<string | null>(null);
    permisoConcedido = signal<boolean>(false);
    notificaciones = signal<NotificacionInterface[]>([]);

    sinLeer = computed(
        () => this.notificaciones().filter((n) => !n.leida).length
    );

    // En el navegador el plugin nativo no existe, asi que las pantallas
    // deben poder seguir funcionando sin notificaciones.
    private get esNativo(): boolean {
        return this.platform.is('capacitor');
    }

    async inicializar(): Promise<void> {
        if (!this.esNativo) return;

        const permiso = await this.pedirPermiso();

        if (!permiso) return;

        await this.crearCanal();

        this.escucharEventos();

        await PushNotifications.register();
    }

    private async crearCanal(): Promise<void> {
        if (!this.platform.is('android')) return;

        await PushNotifications.createChannel({
            id: CANAL_AVISOS,
            name: 'Avisos del restaurante',
            description:
                'Pedidos, mesas, consultas y aprobaciones de clientes.',
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
                true,
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
        });

        PushNotifications.addListener('registrationError', async () => {
            await Haptics.notification({ type: NotificationType.Error });

            this.modal.setOpen(
                true,
                'Error de registro',
                'No se pudo registrar el dispositivo para recibir notificaciones.'
            );
        });

        // Con la app en primer plano Android no dibuja nada en la barra:
        // entrega el aviso y la app decide como mostrarlo.
        PushNotifications.addListener(
            'pushNotificationReceived',
            async (notificacion: PushNotificationSchema) => {
                const nueva = this.agregar(notificacion);
                await this.avisarEnPantalla(nueva);
            }
        );

        PushNotifications.addListener(
            'pushNotificationActionPerformed',
            (accion: ActionPerformed) => {
                const nueva = this.agregar(accion.notification);
                this.marcarLeida(nueva.id);
            }
        );
    }

    private async avisarEnPantalla(
        notificacion: NotificacionInterface
    ): Promise<void> {
        await Haptics.notification({ type: NotificationType.Success });

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
        this.notificaciones.update((actuales) =>
            actuales.map((n) => (n.id === id ? { ...n, leida: true } : n))
        );
    }

    marcarTodasLeidas(): void {
        this.notificaciones.update((actuales) =>
            actuales.map((n) => ({ ...n, leida: true }))
        );
    }

    async limpiar(): Promise<void> {
        this.notificaciones.set([]);

        if (this.esNativo) {
            await PushNotifications.removeAllDeliveredNotifications();
        }
    }

    async recuperarToken(): Promise<string | null> {
        if (this.token()) return this.token();

        const { value } = await Preferences.get({ key: CLAVE_TOKEN });

        this.token.set(value);

        return value;
    }

    async cerrarSesion(): Promise<void> {
        this.notificaciones.set([]);
        this.token.set(null);

        await Preferences.remove({ key: CLAVE_TOKEN });

        if (this.esNativo) {
            await PushNotifications.removeAllListeners();
            await PushNotifications.unregister();
        }
    }
}
