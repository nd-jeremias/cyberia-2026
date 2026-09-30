import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SalonService } from './salon.service';
import { SupabaseService } from './supabase.service';

/**
 * Doble de Supabase.
 *
 * SalonService inyecta `SupabaseService` en lugar de importar el cliente, así
 * que acá se lo reemplaza por este objeto y ningún test sale a la red.
 */
class SupabaseFalso {
    from = vi.fn();
    auth = { getSession: vi.fn() };
    cliente = { channel: vi.fn(), removeChannel: vi.fn() };
}

/**
 * Consulta encadenable: cada método devuelve la misma consulta y, al
 * esperarla, resuelve con `respuesta`, como hace el cliente de Supabase.
 */
function consultaFalsa(respuesta: { data?: unknown; error: unknown }) {
    const consulta = {
        select: vi.fn(),
        update: vi.fn(),
        eq: vi.fn(),
        maybeSingle: vi.fn(),
        then: (resolver: (valor: unknown) => unknown, rechazar?: (motivo: unknown) => unknown) =>
            Promise.resolve(respuesta).then(resolver, rechazar),
    };

    for (const paso of ['select', 'update', 'eq', 'maybeSingle'] as const) {
        consulta[paso].mockReturnValue(consulta);
    }

    return consulta;
}

/** Así responde Postgres al leer una columna que no existe. */
const SIN_COLUMNA_AL_LEER = {
    code: '42703',
    message: 'column usuarios.fecha_ultima_visita does not exist',
};

/** Así responde PostgREST al intentar escribirla. */
const SIN_COLUMNA_AL_ESCRIBIR = {
    code: 'PGRST204',
    message: "Could not find the 'fecha_ultima_visita' column of 'usuarios' in the schema cache",
};

const FIN_DE_VISITA = '2026-09-30T20:00:00.000Z';
const FIN_MS = Date.parse(FIN_DE_VISITA);
const HORA = 60 * 60 * 1000;

describe('SalonService', () => {
    let servicio: SalonService;
    let supabase: SupabaseFalso;

    beforeEach(() => {
        supabase = new SupabaseFalso();

        TestBed.configureTestingModule({
            providers: [{ provide: SupabaseService, useValue: supabase }],
        });

        servicio = TestBed.inject(SalonService);
    });

    describe('cargarSituacion', () => {
        it('trae el estado, la mesa y el fin de la última visita', async () => {
            const consulta = consultaFalsa({
                data: { estado_en_resto: 'libre', mesa_id: null, fecha_ultima_visita: FIN_DE_VISITA },
                error: null,
            });

            supabase.from.mockReturnValue(consulta);

            const situacion = await servicio.cargarSituacion('cliente-1');

            expect(consulta.select).toHaveBeenCalledWith('estado_en_resto, mesa_id, fecha_ultima_visita');
            expect(consulta.eq).toHaveBeenCalledWith('id', 'cliente-1');
            expect(situacion).toEqual({ estado: 'libre', mesaId: null, fechaUltimaVisita: FIN_DE_VISITA });
            expect(servicio.situacion()).toEqual(situacion);
        });

        // Sin sql/migracion-fin-de-visita.sql la columna no existe: el
        // cliente tiene que poder usar la aplicación igual.
        it('sin la migración, vuelve a consultar sin la columna nueva y avisa en la consola', async () => {
            const consola = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
            const sinMigracion = consultaFalsa({ data: null, error: SIN_COLUMNA_AL_LEER });
            const reintento = consultaFalsa({ data: { estado_en_resto: 'sentado', mesa_id: 'mesa-1' }, error: null });

            supabase.from.mockReturnValueOnce(sinMigracion).mockReturnValueOnce(reintento);

            const situacion = await servicio.cargarSituacion('cliente-1');

            expect(reintento.select).toHaveBeenCalledWith('estado_en_resto, mesa_id');
            expect(situacion).toEqual({ estado: 'sentado', mesaId: 'mesa-1', fechaUltimaVisita: null });
            expect(consola).toHaveBeenCalledWith(expect.stringContaining('migracion-fin-de-visita.sql'));

            consola.mockRestore();
        });

        it('no confunde otra columna faltante con la migración pendiente', async () => {
            const otroError = { code: '42703', message: 'column usuarios.otra does not exist' };

            supabase.from.mockReturnValue(consultaFalsa({ data: null, error: otroError }));

            await expect(servicio.cargarSituacion('cliente-1')).rejects.toBe(otroError);
            expect(supabase.from).toHaveBeenCalledTimes(1);
        });

        it('deja la situación vacía si el usuario no está en la tabla', async () => {
            servicio.situacion.set({ estado: 'sentado', mesaId: 'mesa-1', fechaUltimaVisita: null });
            supabase.from.mockReturnValue(consultaFalsa({ data: null, error: null }));

            await expect(servicio.cargarSituacion('cliente-1')).resolves.toBeNull();
            expect(servicio.situacion()).toBeNull();
        });
    });

    describe('acabaDeTerminarSuVisita', () => {
        it('es verdadero si está libre y terminó hace menos de cinco horas', () => {
            servicio.situacion.set({ estado: 'libre', mesaId: null, fechaUltimaVisita: FIN_DE_VISITA });

            expect(servicio.acabaDeTerminarSuVisita(FIN_MS + HORA)).toBe(true);
        });

        it('es falso una vez cumplida la ventana: vuelve a ser un ingreso normal', () => {
            servicio.situacion.set({ estado: 'libre', mesaId: null, fechaUltimaVisita: FIN_DE_VISITA });

            expect(servicio.acabaDeTerminarSuVisita(FIN_MS + 5 * HORA)).toBe(false);
        });

        // Si ya volvió a anotarse, rige el circuito normal aunque la fecha
        // sea reciente.
        it('es falso si el cliente no está libre', () => {
            servicio.situacion.set({ estado: 'esperando_mesa', mesaId: null, fechaUltimaVisita: FIN_DE_VISITA });

            expect(servicio.acabaDeTerminarSuVisita(FIN_MS + HORA)).toBe(false);
        });

        it('es falso si nunca terminó una visita (o falta la migración)', () => {
            servicio.situacion.set({ estado: 'libre', mesaId: null, fechaUltimaVisita: null });

            expect(servicio.acabaDeTerminarSuVisita(FIN_MS)).toBe(false);
        });

        it('es falso si todavía no se cargó la situación', () => {
            expect(servicio.acabaDeTerminarSuVisita(FIN_MS)).toBe(false);
        });
    });

    describe('pagarCuenta (punto 21)', () => {
        it('pasa a "pagando" al cliente sentado', async () => {
            const pago = consultaFalsa({ data: [{ id: 'cliente-1' }], error: null });
            const recarga = consultaFalsa({
                data: { estado_en_resto: 'pagando', mesa_id: 'mesa-1', fecha_ultima_visita: null },
                error: null,
            });

            supabase.from.mockReturnValueOnce(pago).mockReturnValueOnce(recarga);

            const pagando = await servicio.pagarCuenta('cliente-1');

            expect(pagando).toBe(true);
            expect(pago.update).toHaveBeenCalledWith({ estado_en_resto: 'pagando' });
            expect(pago.eq).toHaveBeenCalledWith('id', 'cliente-1');
            // Sólo paga quien está sentado a una mesa.
            expect(pago.eq).toHaveBeenCalledWith('estado_en_resto', 'sentado');
            expect(servicio.situacion()?.estado).toBe('pagando');
        });

        it('devuelve false si no estaba sentado, sin recargar nada', async () => {
            supabase.from.mockReturnValue(consultaFalsa({ data: [], error: null }));

            await expect(servicio.pagarCuenta('cliente-1')).resolves.toBe(false);
            expect(supabase.from).toHaveBeenCalledTimes(1);
        });

        it('propaga el error de la base', async () => {
            const error = new Error('sin conexión');

            supabase.from.mockReturnValue(consultaFalsa({ data: null, error }));

            await expect(servicio.pagarCuenta('cliente-1')).rejects.toBe(error);
        });
    });

    describe('terminarVisita (punto 22)', () => {
        beforeEach(() => {
            // Sólo se congela la fecha: las promesas y los timers siguen reales.
            vi.useFakeTimers({ toFake: ['Date'] });
            vi.setSystemTime(new Date(FIN_DE_VISITA));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('deja al cliente libre, sin mesa y con la hora en que terminó', async () => {
            const cierre = consultaFalsa({ error: null });

            supabase.from.mockReturnValue(cierre);

            await servicio.terminarVisita('cliente-1');

            expect(supabase.from).toHaveBeenCalledWith('usuarios');
            expect(cierre.update).toHaveBeenCalledWith({
                estado_en_resto: 'libre',
                mesa_id: null,
                fecha_ultima_visita: FIN_DE_VISITA,
            });
            expect(cierre.eq).toHaveBeenCalledWith('id', 'cliente-1');
            // Si dos mozos confirman a la vez, el segundo no pisa la fecha.
            expect(cierre.eq).toHaveBeenCalledWith('estado_en_resto', 'pagando');
        });

        // Lo que se pierde sin la migración es el desvío a las encuestas, no
        // el cobro: la mesa y el cliente se liberan igual.
        it('sin la migración, libera igual al cliente y avisa en la consola', async () => {
            const consola = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
            const sinMigracion = consultaFalsa({ error: SIN_COLUMNA_AL_ESCRIBIR });
            const reintento = consultaFalsa({ error: null });

            supabase.from.mockReturnValueOnce(sinMigracion).mockReturnValueOnce(reintento);

            await expect(servicio.terminarVisita('cliente-1')).resolves.toBeUndefined();

            expect(reintento.update).toHaveBeenCalledWith({ estado_en_resto: 'libre', mesa_id: null });
            expect(reintento.eq).toHaveBeenCalledWith('estado_en_resto', 'pagando');
            expect(consola).toHaveBeenCalledWith(expect.stringContaining('migracion-fin-de-visita.sql'));

            consola.mockRestore();
        });

        it('propaga cualquier otro error, para que el cobro no siga', async () => {
            const error = { code: '42501', message: 'permission denied for table usuarios' };

            supabase.from.mockReturnValue(consultaFalsa({ error }));

            await expect(servicio.terminarVisita('cliente-1')).rejects.toBe(error);
            expect(supabase.from).toHaveBeenCalledTimes(1);
        });
    });

    describe('escucharSituacion', () => {
        it('actualiza la situación con la fila que llega, incluido el fin de la visita', () => {
            let alCambiar: ((mensaje: { new: unknown }) => void) | undefined;

            const canal = {
                on: vi.fn((_evento: string, _filtro: unknown, manejador: (mensaje: { new: unknown }) => void) => {
                    alCambiar = manejador;
                    return canal;
                }),
                subscribe: vi.fn(() => canal),
            };

            supabase.cliente.channel.mockReturnValue(canal);

            servicio.escucharSituacion('cliente-1');

            // Así llega el cambio cuando el mozo confirma el pago.
            alCambiar?.({
                new: {
                    id: 'cliente-1',
                    estado_en_resto: 'libre',
                    mesa_id: null,
                    fecha_ultima_visita: FIN_DE_VISITA,
                },
            });

            expect(canal.on).toHaveBeenCalledWith(
                'postgres_changes',
                expect.objectContaining({ table: 'usuarios', filter: 'id=eq.cliente-1' }),
                expect.any(Function)
            );
            expect(servicio.situacion()).toEqual({ estado: 'libre', mesaId: null, fechaUltimaVisita: FIN_DE_VISITA });
        });
    });
});
