import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PedidoInterface } from '../interfaces/pedido.interface';
import { ModalService } from './modal.service';
import { PedidoService } from './pedido.service';
import { SupabaseService } from './supabase.service';

/**
 * Doble de Supabase.
 *
 * El servicio inyecta `SupabaseService` en lugar de importar el cliente, así
 * que acá se lo reemplaza por este objeto y ningún test sale a la red.
 */
class SupabaseFalso {
    from = vi.fn();
    auth = { getSession: vi.fn() };
    cliente = {} as never;
}

/** Arma un pedido completo con valores por defecto sobreescribibles. */
function pedidoDePrueba(
    parcial: Partial<PedidoInterface> = {}
): PedidoInterface {
    return {
        id: 'pedido-1',
        mesaId: 'mesa-1',
        numeroMesa: 4,
        clienteId: 'cliente-1',
        estado: 'Pendiente de Confirmación',
        precioTotalNeto: 10000,
        descuentoJuego: 0,
        propinaPorcentaje: 0,
        fecha: '2026-08-31T12:00:00.000Z',
        detalles: [
            {
                id: 'detalle-1',
                pedidoId: 'pedido-1',
                productoId: 'producto-1',
                nombreProducto: 'Milanesa',
                cantidad: 2,
                precioUnitario: 4000,
                precioTotalParcial: 8000,
                estadoProducto: 'Pendiente',
                tiempoElaboracionMinutos: 20,
            },
            {
                id: 'detalle-2',
                pedidoId: 'pedido-1',
                productoId: 'producto-2',
                nombreProducto: 'Gaseosa',
                cantidad: 1,
                precioUnitario: 2000,
                precioTotalParcial: 2000,
                estadoProducto: 'Pendiente',
                tiempoElaboracionMinutos: 5,
            },
        ],
        ...parcial,
    };
}

describe('PedidoService', () => {
    let servicio: PedidoService;
    let modal: ModalService;
    let supabase: SupabaseFalso;

    beforeEach(() => {
        supabase = new SupabaseFalso();

        TestBed.configureTestingModule({
            providers: [{ provide: SupabaseService, useValue: supabase }],
        });

        servicio = TestBed.inject(PedidoService);
        modal = TestBed.inject(ModalService);
    });

    it('se crea', () => {
        expect(servicio).toBeTruthy();
    });

    describe('tiempoEstimado', () => {
        it('devuelve el tiempo del producto más lento, no la suma', () => {
            // Cocina y bar trabajan en paralelo: el pedido tarda lo que tarda
            // el ítem más lento (20), no 20 + 5.
            expect(servicio.tiempoEstimado(pedidoDePrueba())).toBe(20);
        });

        it('devuelve cero si el pedido no tiene detalles', () => {
            expect(servicio.tiempoEstimado(pedidoDePrueba({ detalles: [] }))).toBe(
                0
            );
        });
    });

    describe('totalConDescuento', () => {
        it('devuelve el neto cuando no hay descuento ni propina', () => {
            expect(servicio.totalConDescuento(pedidoDePrueba())).toBe(10000);
        });

        it('resta el descuento obtenido en los juegos', () => {
            expect(
                servicio.totalConDescuento(pedidoDePrueba({ descuentoJuego: 10 }))
            ).toBe(9000);
        });

        it('suma la propina elegida por el cliente', () => {
            expect(
                servicio.totalConDescuento(
                    pedidoDePrueba({ propinaPorcentaje: 20 })
                )
            ).toBe(12000);
        });

        it('aplica descuento y propina sobre el neto, no en cascada', () => {
            // 10000 - 10% + 20% = 11000.
            // Encadenándolos daría 10800, que sería incorrecto.
            const ambos = pedidoDePrueba({
                descuentoJuego: 10,
                propinaPorcentaje: 20,
            });

            expect(servicio.totalConDescuento(ambos)).toBe(11000);
        });
    });

    describe('filtros por estado', () => {
        it('separa los pendientes de confirmación de los listos', () => {
            servicio.pedidos.set([
                pedidoDePrueba({ id: 'a', estado: 'Pendiente de Confirmación' }),
                pedidoDePrueba({ id: 'b', estado: 'Listo para Entregar' }),
                pedidoDePrueba({ id: 'c', estado: 'Pagado' }),
            ]);

            expect(
                servicio.pendientesDeConfirmacion().map((p) => p.id)
            ).toEqual(['a']);
            expect(servicio.listosParaEntregar().map((p) => p.id)).toEqual([
                'b',
            ]);
        });
    });

    describe('crear', () => {
        /**
         * Deja resolviendo las tres escrituras de `crear`: el pedido, sus
         * detalles y el paso del cliente a "sentado".
         */
        function mockCrear(errorEstado: Error | null = null) {
            const insertPedido = vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi
                        .fn()
                        .mockResolvedValue({ data: { id: 'nuevo' }, error: null }),
                }),
            });

            const filtroEstado = vi.fn().mockResolvedValue({ error: errorEstado });
            const updateCliente = vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({ eq: filtroEstado }),
            });

            supabase.from
                .mockReturnValueOnce({ insert: insertPedido })
                .mockReturnValueOnce({
                    insert: vi.fn().mockResolvedValue({ error: null }),
                })
                .mockReturnValueOnce({ update: updateCliente });

            return { insertPedido, updateCliente, filtroEstado };
        }

        it('rechaza un pedido sin ítems y avisa al usuario', async () => {
            const espia = vi.spyOn(modal, 'setOpen');

            const resultado = await servicio.crear({
                mesaId: 'mesa-1',
                clienteId: 'cliente-1',
                items: [],
            });

            expect(resultado).toBeNull();
            expect(espia).toHaveBeenCalled();
            // No debe consultar la base si el pedido está vacío.
            expect(supabase.from).not.toHaveBeenCalled();
        });

        it('calcula el total como cantidad por precio unitario', async () => {
            const { insertPedido } = mockCrear();

            const id = await servicio.crear({
                mesaId: 'mesa-1',
                clienteId: 'cliente-1',
                items: [
                    { productoId: 'p1', cantidad: 2, precioUnitario: 4000 },
                    { productoId: 'p2', cantidad: 3, precioUnitario: 1000 },
                ],
            });

            expect(id).toBe('nuevo');
            // 2 * 4000 + 3 * 1000 = 11000
            expect(insertPedido).toHaveBeenCalledWith(
                expect.objectContaining({ precio_total_neto: 11000 })
            );
        });

        it('nace en estado Pendiente de Confirmación, esperando al mozo', async () => {
            const { insertPedido } = mockCrear();

            await servicio.crear({
                mesaId: 'mesa-1',
                clienteId: 'cliente-1',
                items: [{ productoId: 'p1', cantidad: 1, precioUnitario: 100 }],
            });

            expect(insertPedido).toHaveBeenCalledWith(
                expect.objectContaining({ estado: 'Pendiente de Confirmación' })
            );
        });

        // Punto 13: al pedir, el cliente deja de estar "con mesa asignada".
        it('pasa al cliente con mesa asignada a sentado', async () => {
            const { updateCliente, filtroEstado } = mockCrear();

            await servicio.crear({
                mesaId: 'mesa-1',
                clienteId: 'cliente-1',
                items: [{ productoId: 'p1', cantidad: 1, precioUnitario: 100 }],
            });

            expect(supabase.from).toHaveBeenNthCalledWith(3, 'usuarios');
            expect(updateCliente).toHaveBeenCalledWith({
                estado_en_resto: 'sentado',
            });
            // No pisa un estado posterior, como el de quien ya pidió la cuenta.
            expect(filtroEstado).toHaveBeenCalledWith(
                'estado_en_resto',
                'mesa_asignada'
            );
        });

        it('conserva el pedido aunque falle el cambio de estado del cliente', async () => {
            vi.spyOn(console, 'error').mockImplementation(() => undefined);
            const espia = vi.spyOn(modal, 'setOpen');
            mockCrear(new Error('sin permiso'));

            const id = await servicio.crear({
                mesaId: 'mesa-1',
                clienteId: 'cliente-1',
                items: [{ productoId: 'p1', cantidad: 1, precioUnitario: 100 }],
            });

            expect(id).toBe('nuevo');
            expect(espia).not.toHaveBeenCalled();
        });
    });

    describe('pedidoActualDelCliente', () => {
        /** Encadena select → eq → neq → order → limit → maybeSingle. */
        function mockConsulta(respuesta: { data: unknown; error: unknown }) {
            const consulta = {
                select: vi.fn(),
                eq: vi.fn(),
                neq: vi.fn(),
                order: vi.fn(),
                limit: vi.fn(),
                maybeSingle: vi.fn().mockResolvedValue(respuesta),
            };

            for (const paso of ['select', 'eq', 'neq', 'order', 'limit'] as const) {
                consulta[paso].mockReturnValue(consulta);
            }

            supabase.from.mockReturnValue(consulta);

            return consulta;
        }

        it('busca el último pedido no pagado del cliente', async () => {
            const consulta = mockConsulta({ data: null, error: null });

            await servicio.pedidoActualDelCliente('cliente-1');

            expect(supabase.from).toHaveBeenCalledWith('pedidos');
            expect(consulta.eq).toHaveBeenCalledWith('cliente_id', 'cliente-1');
            expect(consulta.neq).toHaveBeenCalledWith('estado', 'Pagado');
            expect(consulta.order).toHaveBeenCalledWith('fecha', {
                ascending: false,
            });
        });

        it('devuelve null si el cliente todavía no pidió', async () => {
            mockConsulta({ data: null, error: null });

            await expect(
                servicio.pedidoActualDelCliente('cliente-1')
            ).resolves.toBeNull();
        });

        it('une la mesa y los productos del pedido', async () => {
            mockConsulta({
                data: {
                    id: 'pedido-1',
                    mesa_id: 'mesa-1',
                    cliente_id: 'cliente-1',
                    estado: 'Confirmado',
                    precio_total_neto: '8000.00',
                    descuento_juego: '0',
                    propina_porcentaje: '0',
                    fecha: '2026-09-12T20:00:00.000Z',
                    mesas: { numero_mesa: 1 },
                    pedido_detalles: [
                        {
                            id: 'detalle-1',
                            pedido_id: 'pedido-1',
                            producto_id: 'producto-1',
                            cantidad: 2,
                            precio_unitario: '4000.00',
                            precio_total_parcial: '8000.00',
                            estado_producto: 'Pendiente',
                            productos: {
                                nombre: 'Milanesa',
                                tiempo_elaboracion_minutos: 25,
                            },
                        },
                    ],
                },
                error: null,
            });

            const pedido = await servicio.pedidoActualDelCliente('cliente-1');

            expect(pedido?.numeroMesa).toBe(1);
            // Postgres devuelve NUMERIC como texto: el servicio lo convierte.
            expect(pedido?.precioTotalNeto).toBe(8000);
            expect(pedido?.detalles[0]).toEqual(
                expect.objectContaining({
                    nombreProducto: 'Milanesa',
                    precioTotalParcial: 8000,
                    tiempoElaboracionMinutos: 25,
                })
            );
        });

        it('propaga el error para que la pantalla lo muestre', async () => {
            mockConsulta({ data: null, error: new Error('sin conexión') });

            await expect(
                servicio.pedidoActualDelCliente('cliente-1')
            ).rejects.toThrow('sin conexión');
        });
    });

    describe('cambios de estado', () => {
        /** Deja `from().update().eq()` resolviendo sin error. */
        function mockUpdateOk() {
            const eq = vi.fn().mockResolvedValue({ error: null });
            const update = vi.fn().mockReturnValue({ eq });

            supabase.from.mockReturnValue({ update });

            return { update, eq };
        }

        it('confirmar deja el pedido Confirmado y refleja el cambio en memoria', async () => {
            const { update } = mockUpdateOk();

            servicio.pedidos.set([pedidoDePrueba()]);

            const ok = await servicio.confirmar('pedido-1');

            expect(ok).toBe(true);
            expect(update).toHaveBeenCalledWith({ estado: 'Confirmado' });
            expect(servicio.pedidos()[0].estado).toBe('Confirmado');
        });

        it('rechazar deja el pedido Rechazado', async () => {
            const { update } = mockUpdateOk();

            await servicio.rechazar('pedido-1');

            expect(update).toHaveBeenCalledWith({ estado: 'Rechazado' });
        });

        it('entregar deja el pedido Entregado', async () => {
            const { update } = mockUpdateOk();

            await servicio.entregar('pedido-1');

            expect(update).toHaveBeenCalledWith({ estado: 'Entregado' });
        });

        it('avisa con un mensaje y devuelve false si la base falla', async () => {
            const espia = vi.spyOn(modal, 'setOpen');

            supabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi
                        .fn()
                        .mockResolvedValue({ error: new Error('sin conexión') }),
                }),
            });

            const ok = await servicio.confirmar('pedido-1');

            expect(ok).toBe(false);
            expect(espia).toHaveBeenCalledWith('Error', 'sin conexión');
        });

        it('apaga el indicador de carga aunque la operación falle', async () => {
            supabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockRejectedValue(new Error('caída')),
                }),
            });

            await servicio.confirmar('pedido-1');

            expect(servicio.cargando()).toBe(false);
        });
    });

    describe('cambiarEstadoItem', () => {
        it('actualiza sólo el detalle indicado', async () => {
            supabase.from.mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                }),
            });

            servicio.pedidos.set([pedidoDePrueba()]);

            await servicio.cambiarEstadoItem('detalle-1', 'Listo');

            const detalles = servicio.pedidos()[0].detalles;

            expect(detalles[0].estadoProducto).toBe('Listo');
            // El otro ítem no debe verse afectado.
            expect(detalles[1].estadoProducto).toBe('Pendiente');
        });
    });
});
