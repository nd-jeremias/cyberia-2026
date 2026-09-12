import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MesaInterface } from '../interfaces/mesa.interface';
import { MesaService } from './mesa.service';
import { ModalService } from './modal.service';
import { SupabaseService } from './supabase.service';

class SupabaseFalso {
    from = vi.fn();
    auth = { getSession: vi.fn() };
    cliente = {} as never;
}

function mesaDePrueba(parcial: Partial<MesaInterface> = {}): MesaInterface {
    return {
        id: 'mesa-1',
        numeroMesa: 1,
        cantidadLugares: 4,
        tipo: 'estándar',
        disponibilidad: 'disponible',
        clienteId: null,
        qrUrl: 'https://ejemplo/qr.png',
        fotoUrl: 'https://ejemplo/mesa.png',
        ...parcial,
    };
}

describe('MesaService', () => {
    let servicio: MesaService;
    let modal: ModalService;
    let supabase: SupabaseFalso;

    beforeEach(() => {
        supabase = new SupabaseFalso();

        TestBed.configureTestingModule({
            providers: [{ provide: SupabaseService, useValue: supabase }],
        });

        servicio = TestBed.inject(MesaService);
        modal = TestBed.inject(ModalService);
    });

    it('se crea', () => {
        expect(servicio).toBeTruthy();
    });

    describe('filtros', () => {
        it('separa las mesas disponibles de las ocupadas', () => {
            servicio.mesas.set([
                mesaDePrueba({ id: 'a', disponibilidad: 'disponible' }),
                mesaDePrueba({ id: 'b', disponibilidad: 'ocupada' }),
                mesaDePrueba({ id: 'c', disponibilidad: 'Reservada' }),
            ]);

            expect(servicio.disponibles().map((m) => m.id)).toEqual(['a']);
            expect(servicio.ocupadas().map((m) => m.id)).toEqual(['b']);
        });
    });

    describe('mesaDelCliente', () => {
        it('encuentra la mesa de un cliente registrado', () => {
            servicio.mesas.set([
                mesaDePrueba({ id: 'a' }),
                mesaDePrueba({ id: 'b', clienteId: 'cliente-1' }),
            ]);

            expect(servicio.mesaDelCliente('cliente-1')?.id).toBe('b');
        });

        // El anónimo también es un usuario de Auth: comparte la columna.
        it('también encuentra la de un cliente anónimo', () => {
            servicio.mesas.set([mesaDePrueba({ id: 'b', clienteId: 'anon-1' })]);

            expect(servicio.mesaDelCliente('anon-1')?.id).toBe('b');
        });

        it('devuelve null si el cliente no tiene mesa', () => {
            servicio.mesas.set([mesaDePrueba()]);

            expect(servicio.mesaDelCliente('cliente-9')).toBeNull();
        });
    });

    // Las tres verificaciones que exige el punto 10 del enunciado.
    describe('asignarCliente', () => {
        /** Deja el update encadenado devolviendo las filas indicadas. */
        function mockUpdate(filas: { id: string }[] | null, error: unknown = null) {
            const eqDisponibilidad = vi.fn().mockReturnValue({
                select: vi.fn().mockResolvedValue({ data: filas, error }),
            });
            const eqId = vi.fn().mockReturnValue({ eq: eqDisponibilidad });
            const update = vi.fn().mockReturnValue({ eq: eqId });

            supabase.from.mockReturnValue({
                update,
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
            });

            return { update };
        }

        it('rechaza si el cliente ya tiene otra mesa e indica cuál es', async () => {
            const espia = vi.spyOn(modal, 'setOpen');

            servicio.mesas.set([
                mesaDePrueba({ id: 'mesa-1' }),
                mesaDePrueba({
                    id: 'mesa-7',
                    numeroMesa: 7,
                    clienteId: 'cliente-1',
                }),
            ]);

            const ok = await servicio.asignarCliente('mesa-1', 'cliente-1');

            expect(ok).toBe(false);
            // El enunciado pide indicar cuál es la mesa, no sólo negar el paso.
            expect(espia).toHaveBeenCalledWith(
                'El cliente ya tiene mesa',
                expect.stringContaining('7')
            );
        });

        it('permite reasignar la misma mesa que el cliente ya tiene', async () => {
            mockUpdate([{ id: 'mesa-1' }]);

            servicio.mesas.set([mesaDePrueba({ id: 'mesa-1', clienteId: 'cliente-1' })]);

            const ok = await servicio.asignarCliente('mesa-1', 'cliente-1');

            expect(ok).toBe(true);
        });

        it('rechaza si la mesa está asignada a otro cliente', async () => {
            const espia = vi.spyOn(modal, 'setOpen');

            servicio.mesas.set([mesaDePrueba({ id: 'mesa-1', clienteId: 'otro' })]);

            const ok = await servicio.asignarCliente('mesa-1', 'cliente-1');

            expect(ok).toBe(false);
            expect(espia).toHaveBeenCalledWith(
                'Mesa ocupada',
                expect.stringContaining('otro cliente')
            );
        });

        it('rechaza si la mesa figura como ocupada', async () => {
            servicio.mesas.set([
                mesaDePrueba({ id: 'mesa-1', disponibilidad: 'ocupada' }),
            ]);

            expect(await servicio.asignarCliente('mesa-1', 'cliente-1')).toBe(
                false
            );
        });

        it('rechaza si la mesa no existe', async () => {
            const espia = vi.spyOn(modal, 'setOpen');

            servicio.mesas.set([]);

            const ok = await servicio.asignarCliente('inexistente', 'cliente-1');

            expect(ok).toBe(false);
            expect(espia).toHaveBeenCalledWith(
                'Mesa inexistente',
                expect.any(String)
            );
        });

        it('filtra por disponibilidad para evitar una asignación simultánea', async () => {
            const { update } = mockUpdate([{ id: 'mesa-1' }]);

            servicio.mesas.set([mesaDePrueba({ id: 'mesa-1' })]);

            await servicio.asignarCliente('mesa-1', 'cliente-1');

            // El update marca la mesa como ocupada; el filtro por
            // disponibilidad va en los .eq() encadenados.
            expect(update).toHaveBeenCalledWith(
                expect.objectContaining({ disponibilidad: 'ocupada' })
            );
        });

        it('avisa si otro usuario tomó la mesa en el medio', async () => {
            const espia = vi.spyOn(modal, 'setOpen');

            // Cero filas afectadas: el filtro por disponibilidad no encontró
            // la mesa libre, otro metre la tomó primero.
            mockUpdate([]);

            servicio.mesas.set([mesaDePrueba({ id: 'mesa-1' })]);

            const ok = await servicio.asignarCliente('mesa-1', 'cliente-1');

            expect(ok).toBe(false);
            expect(espia).toHaveBeenCalledWith(
                'Mesa ocupada',
                expect.stringContaining('instantes')
            );
        });

        it('guarda al cliente en cliente_id, sea registrado o anónimo', async () => {
            const { update } = mockUpdate([{ id: 'mesa-1' }]);

            servicio.mesas.set([mesaDePrueba({ id: 'mesa-1' })]);

            await servicio.asignarCliente('mesa-1', 'anon-1');

            expect(update).toHaveBeenCalledWith({
                cliente_id: 'anon-1',
                disponibilidad: 'ocupada',
            });
        });
    });

    describe('liberar', () => {
        it('deja la mesa disponible y sin cliente', async () => {
            const update = vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
            });

            supabase.from.mockReturnValue({
                update,
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: [], error: null }),
                }),
            });

            const ok = await servicio.liberar('mesa-1');

            expect(ok).toBe(true);
            expect(update).toHaveBeenCalledWith({
                disponibilidad: 'disponible',
                cliente_id: null,
            });
        });
    });
});
