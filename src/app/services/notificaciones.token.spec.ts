import { TestBed } from '@angular/core/testing';
import { Platform, ToastController } from '@ionic/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalService } from './modal.service';
import { NotificacionesService } from './notificaciones.service';
import { SupabaseService } from './supabase.service';
import { VibracionService } from './vibracion.service';

/**
 * Dobles de los plugins nativos y de Supabase.
 *
 * `vi.hoisted` es necesario porque `vi.mock` se eleva por encima de los
 * imports: sin esto, las fábricas correrían antes de que existieran los objetos.
 *
 * Los plugins se reemplazan con `vi.mock` porque son paquetes. Supabase no:
 * el sistema de tests de Angular no admite `vi.mock` sobre imports relativos,
 * así que entra por TestBed en lugar de `SupabaseService`.
 *
 * `vi.mock` sólo es confiable si cada spec corre aislado, y por eso angular.json
 * activa `isolate` en los tests. Sin eso los specs comparten los módulos ya
 * cargados: si otro cargó antes el plugin real, este spec recibe el real y
 * falla con "PushNotifications plugin is not implemented on web", según el
 * orden en que se repartan los archivos.
 */
const dobles = vi.hoisted(() => {
    /** Cada `update()` que llega a la tabla `usuarios`. */
    const actualizaciones: Record<string, unknown>[] = [];

    /** Cada filtro que se aplica al buscar destinatarios, en orden. */
    const filtros: unknown[][] = [];

    /** Lo que devuelve la búsqueda de destinatarios por perfil. */
    const destinatarios: { token_push: string }[] = [];

    /** Capacitor Preferences, en memoria. */
    const preferencias = new Map<string, string>();

    /** Handlers que el servicio le pasa a PushNotifications.addListener. */
    const escuchas = new Map<string, (dato: unknown) => unknown>();

    return {
        actualizaciones,
        filtros,
        destinatarios,
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
            // Consulta encadenable: `maybeSingle` es la búsqueda de una
            // persona puntual, y esperar la consulta sin más es la búsqueda
            // por perfil, que devuelve `destinatarios`.
            from: vi.fn(() => {
                const consulta = {
                    update: (valores: Record<string, unknown>) => {
                        actualizaciones.push(valores);

                        return { eq: async () => ({ error: null }) };
                    },
                    select: () => consulta,
                    in: (columna: string, valores: unknown) => {
                        filtros.push(['in', columna, valores]);
                        return consulta;
                    },
                    eq: (columna: string, valor: unknown) => {
                        filtros.push(['eq', columna, valor]);
                        return consulta;
                    },
                    not: (columna: string, operador: string, valor: unknown) => {
                        filtros.push(['not', columna, operador, valor]);
                        return consulta;
                    },
                    maybeSingle: async () => ({ data: { token_push: 'token-cliente' }, error: null }),
                    then: (resolver: (valor: unknown) => unknown, rechazar?: (motivo: unknown) => unknown) =>
                        Promise.resolve({ data: [...destinatarios], error: null }).then(resolver, rechazar),
                };

                return consulta;
            }),
            cliente: {
                functions: {
                    invoke: vi.fn(async () => ({ data: { enviados: 1 }, error: null }) as { data: unknown; error: unknown }),
                },
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

/**
 * Ciclo de vida del token push y envío de avisos.
 *
 * Va aparte de `notificaciones.service.spec.ts` porque acá se reemplazan los
 * plugins nativos y Supabase por dobles, y esos reemplazos valen para todo el
 * archivo: el otro spec necesita el servicio tal cual corre en el navegador.
 */
describe('NotificacionesService: token y envíos', () => {
    let servicio: NotificacionesService;

    /** Simula el token que entrega Firebase tras registrarse. */
    const llegaElToken = async (valor: string) => {
        await dobles.escuchas.get('registration')?.({ value: valor });
    };

    beforeEach(() => {
        dobles.actualizaciones.length = 0;
        dobles.filtros.length = 0;
        dobles.destinatarios.length = 0;
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
                { provide: SupabaseService, useValue: dobles.supabase },
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

    // La usa la pantalla del metre al asignar una mesa (punto 10).
    it('enviarAvisoAUsuario le manda el aviso al token de esa persona', async () => {
        await servicio.enviarAvisoAUsuario('usuario-9', 'Mesa asignada', 'Te tocó la mesa 3', 'mesa-asignada');

        expect(dobles.supabase.cliente.functions.invoke).toHaveBeenCalledWith(
            'enviar-notificacion',
            expect.objectContaining({
                body: expect.objectContaining({ tokens: ['token-cliente'], titulo: 'Mesa asignada' }),
            })
        );
    });

    /**
     * Punto 22: así avisa la pantalla del mozo al dueño y al supervisor.
     *
     * Los perfiles tienen que coincidir letra por letra con el ENUM
     * `usuarios_rol` de la base ('dueño', con eñe): uno mal escrito no falla,
     * simplemente no encuentra a nadie.
     */
    describe('enviarAvisos (punto 22: dueño y supervisor)', () => {
        const avisarPago = () =>
            servicio.enviarAvisos(
                ['dueño', 'supervisor'],
                'Pago confirmado',
                'Mesa 4: el mozo confirmó el pago y la mesa quedó libre.',
                'pago'
            );

        it('busca a los usuarios activos de esos perfiles que tienen el teléfono registrado', async () => {
            dobles.destinatarios.push({ token_push: 'token-duenio' });

            await avisarPago();

            expect(dobles.supabase.from).toHaveBeenCalledWith('usuarios');
            expect(dobles.filtros).toEqual([
                ['in', 'perfil', ['dueño', 'supervisor']],
                ['eq', 'estado', 'Activo'],
                ['not', 'token_push', 'is', null],
            ]);
        });

        it('manda un solo envío con los tokens de todos', async () => {
            dobles.destinatarios.push({ token_push: 'token-duenio' }, { token_push: 'token-supervisor' });

            await avisarPago();

            expect(dobles.supabase.cliente.functions.invoke).toHaveBeenCalledTimes(1);
            expect(dobles.supabase.cliente.functions.invoke).toHaveBeenCalledWith('enviar-notificacion', {
                body: {
                    tokens: ['token-duenio', 'token-supervisor'],
                    titulo: 'Pago confirmado',
                    cuerpo: 'Mesa 4: el mozo confirmó el pago y la mesa quedó libre.',
                    tipo: 'pago',
                },
            });
        });

        // Es lo que pasa si el dueño y el supervisor nunca entraron desde un
        // teléfono: no hay a quién mandarle nada, y no es un error.
        it('no llama a la función si nadie de esos perfiles tiene el teléfono registrado', async () => {
            await expect(avisarPago()).resolves.toBeUndefined();

            expect(dobles.supabase.cliente.functions.invoke).not.toHaveBeenCalled();
        });

        // La pantalla del mozo atrapa este error para no mostrar como fallido
        // un cobro que ya se registró.
        it('lanza si la función de envío falla', async () => {
            const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined);

            dobles.destinatarios.push({ token_push: 'token-duenio' });
            dobles.supabase.cliente.functions.invoke.mockResolvedValueOnce({
                data: null,
                error: new Error('Firebase no respondió'),
            });

            await expect(avisarPago()).rejects.toThrow('Error al enviar notificaciones.');

            consola.mockRestore();
        });
    });
});
