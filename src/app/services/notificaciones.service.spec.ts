import { TestBed } from '@angular/core/testing';
import { Platform, ToastController } from '@ionic/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalService } from './modal.service';
import { NotificacionesService } from './notificaciones.service';
import { VibracionService } from './vibracion.service';

/**
 * Dobles de los plugins nativos y de Supabase.
 *
 * `vi.hoisted` es necesario porque `vi.mock` se eleva por encima de los
 * imports: sin esto, las fábricas correrían antes de que existieran los objetos.
 */
const dobles = vi.hoisted(() => {
    /** Cada `update()` que llega a la tabla `usuarios`. */
    const actualizaciones: Record<string, unknown>[] = [];

    /** Capacitor Preferences, en memoria. */
    const preferencias = new Map<string, string>();

    /** Handlers que el servicio le pasa a PushNotifications.addListener. */
    const escuchas = new Map<string, (dato: unknown) => unknown>();

    return {
        actualizaciones,
        preferencias,
        escuchas,

        push: {
            checkPermissions: vi.fn(async () => ({ receive: 'granted' })),
            requestPermissions: vi.fn(async () => ({ receive: 'granted' })),
            register: vi.fn(async () => undefined),
            unregister: vi.fn(async () => undefined),
            createChannel: vi.fn(async () => undefined),
            removeAllListeners: vi.fn(async () => undefined),
            removeAllDeliveredNotifications: vi.fn(async () => undefined),
            addListener: vi.fn((evento: string, handler: (dato: unknown) => unknown) => {
                escuchas.set(evento, handler);

                return Promise.resolve({ remove: vi.fn() });
            }),
        },

        supabase: {
            auth: {
                onAuthStateChange: vi.fn(),
                getSession: vi.fn(async () => ({
                    data: { session: { user: { id: 'usuario-1' } } },
                    error: null,
                })),
            },
            from: vi.fn(() => ({
                update: (valores: Record<string, unknown>) => {
                    actualizaciones.push(valores);

                    return { eq: async () => ({ error: null }) };
                },
                select: () => ({
                    eq: () => ({
                        maybeSingle: async () => ({ data: { token_push: 'token-cliente' }, error: null }),
                    }),
                }),
            })),
            functions: {
                invoke: vi.fn(async () => ({ data: { enviados: 1 }, error: null })),
            },
        },
    };
});

vi.mock('@capacitor/push-notifications', () => ({ PushNotifications: dobles.push }));

vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: async ({ key }: { key: string }) => ({ value: dobles.preferencias.get(key) ?? null }),
        set: async ({ key, value }: { key: string; value: string }) => {
            dobles.preferencias.set(key, value);
        },
        remove: async ({ key }: { key: string }) => {
            dobles.preferencias.delete(key);
        },
    },
}));

vi.mock('./supabase.service', () => ({ supabase: dobles.supabase }));

describe('NotificacionesService', () => {
    let servicio: NotificacionesService;

    /** Simula el token que entrega Firebase tras registrarse. */
    const llegaElToken = async (valor: string) => {
        await dobles.escuchas.get('registration')?.({ value: valor });
    };

    beforeEach(() => {
        dobles.actualizaciones.length = 0;
        dobles.preferencias.clear();
        dobles.escuchas.clear();

        vi.clearAllMocks();

        TestBed.configureTestingModule({
            providers: [
                // 'capacitor' hace que el servicio se comporte como en el
                // teléfono; 'android' queda en false para no probar el canal.
                { provide: Platform, useValue: { is: (plataforma: string) => plataforma === 'capacitor' } },
                { provide: ToastController, useValue: { create: async () => ({ present: async () => undefined }) } },
                { provide: ModalService, useValue: { setOpen: vi.fn() } },
                { provide: VibracionService, useValue: { error: vi.fn(), exito: vi.fn() } },
            ],
        });

        servicio = TestBed.inject(NotificacionesService);
    });

    it('guarda el token en la fila del usuario al iniciar sesión', async () => {
        await servicio.alIniciarSesion();
        await llegaElToken('token-abc');

        expect(servicio.token()).toBe('token-abc');
        expect(dobles.actualizaciones).toContainEqual({ token_push: 'token-abc' });
    });

    it('deja el token_push en NULL al cerrar sesión', async () => {
        await servicio.alIniciarSesion();
        await llegaElToken('token-abc');

        dobles.actualizaciones.length = 0;

        await servicio.cerrarSesion();

        expect(dobles.actualizaciones).toContainEqual({ token_push: null });
    });

    /**
     * REGRESIÓN: el token no se renovaba al volver a entrar.
     *
     * `cerrarSesion()` desarmaba el plugin (`removeAllListeners()` y
     * `unregister()`) y borraba el token local, pero la bandera `inicializado`
     * quedaba en true e `inicializar()` sólo corría en el arranque. Resultado:
     * en el segundo ingreso no llegaba ningún `registration` y el usuario
     * nuevo se quedaba con `token_push` en NULL hasta reiniciar la aplicación.
     */
    it('vuelve a asociar el dispositivo en el segundo ingreso, sin reiniciar la app', async () => {
        await servicio.alIniciarSesion();
        await llegaElToken('token-abc');

        await servicio.cerrarSesion();

        // El dispositivo sigue registrado: lo que se corta es sólo el vínculo
        // con la persona que se fue.
        expect(dobles.push.removeAllListeners).not.toHaveBeenCalled();
        expect(dobles.push.unregister).not.toHaveBeenCalled();
        expect(servicio.token()).toBe('token-abc');

        dobles.actualizaciones.length = 0;

        // Segundo ingreso en la misma corrida de la aplicación.
        await servicio.alIniciarSesion();

        // Se le vuelve a pedir el token a Firebase...
        expect(dobles.push.register).toHaveBeenCalledTimes(2);
        // ...y la fila del usuario queda con el token, que era lo que fallaba.
        expect(dobles.actualizaciones).toContainEqual({ token_push: 'token-abc' });
    });

    it('no registra los listeners dos veces', async () => {
        await servicio.inicializar();
        await servicio.inicializar();
        await servicio.alIniciarSesion();

        // Los cuatro eventos del plugin, una sola vez cada uno.
        expect(dobles.push.addListener).toHaveBeenCalledTimes(4);
    });

    it('vacía la bandeja al cerrar sesión', async () => {
        await servicio.alIniciarSesion();
        await llegaElToken('token-abc');

        await dobles.escuchas.get('pushNotificationReceived')?.({
            id: '1',
            title: 'Pedido listo',
            body: 'Mesa 3',
            data: { tipo: 'pedido-estado' },
        });

        expect(servicio.notificaciones()).toHaveLength(1);

        await servicio.cerrarSesion();

        expect(servicio.notificaciones()).toHaveLength(0);
    });

    // La usa MesaService al asignar una mesa (punto 10).
    it('enviarAvisoAUsuario le manda el aviso al token de esa persona', async () => {
        await servicio.enviarAvisoAUsuario('usuario-9', 'Mesa asignada', 'Te tocó la mesa 3', 'mesa-asignada');

        expect(dobles.supabase.functions.invoke).toHaveBeenCalledWith(
            'enviar-notificacion',
            expect.objectContaining({
                body: expect.objectContaining({ tokens: ['token-cliente'], titulo: 'Mesa asignada' }),
            })
        );
    });
});
