import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PedidoInterface } from '../../interfaces/pedido.interface';
import { ModalService } from '../../services/modal.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { PedidoService } from '../../services/pedido.service';
import { PedidosPage } from './pedidos.page';

function pedidoDePrueba(parcial: Partial<PedidoInterface> = {}): PedidoInterface {
    return {
        id: 'pedido-1',
        mesaId: 'mesa-1',
        numeroMesa: 4,
        clienteId: 'cliente-1',
        estadoCliente: 'pagando',
        estado: 'Recibido',
        precioTotalNeto: 10000,
        descuentoJuego: 0,
        propinaPorcentaje: 0,
        fecha: '2026-09-30T20:00:00.000Z',
        detalles: [],
        ...parcial,
    };
}

/**
 * Punto 22: "luego de la confirmación de pago, la notificación automática
 * llega al dueño y al supervisor".
 *
 * El cobro en sí se prueba en pedido.service.spec.ts; acá, lo que hace la
 * pantalla del mozo con el resultado. La pantalla se crea sin plantilla.
 */
describe('PedidosPage: confirmar el pago (punto 22)', () => {
    let pagina: PedidosPage;

    const pedidoService = {
        pedidos: signal<PedidoInterface[]>([]),
        pendientesDeConfirmacion: signal<PedidoInterface[]>([]),
        listosParaEntregar: signal<PedidoInterface[]>([]),
        pagosPorConfirmar: signal<PedidoInterface[]>([]),
        cargando: signal(false),
        confirmarPago: vi.fn<(pedido: PedidoInterface) => Promise<boolean>>(),
        listarSinPagar: vi.fn().mockResolvedValue(undefined),
    };
    const modal = { setOpen: vi.fn() };
    const notificaciones = { enviarAvisos: vi.fn() };

    beforeEach(() => {
        vi.clearAllMocks();
        notificaciones.enviarAvisos.mockResolvedValue(undefined);

        TestBed.configureTestingModule({
            providers: [
                { provide: PedidoService, useValue: pedidoService },
                { provide: ModalService, useValue: modal },
                { provide: NotificacionesService, useValue: notificaciones },
            ],
        });

        pagina = TestBed.runInInjectionContext(() => new PedidosPage());
    });

    it('con el cobro registrado, le confirma al mozo y avisa al dueño y al supervisor', async () => {
        pedidoService.confirmarPago.mockResolvedValue(true);

        await pagina.onConfirmarPago(pedidoDePrueba());

        expect(modal.setOpen).toHaveBeenCalledWith('Pago confirmado', 'La mesa 4 quedó libre.', 'info');
        expect(notificaciones.enviarAvisos).toHaveBeenCalledWith(
            ['dueño', 'supervisor'],
            'Pago confirmado',
            'Mesa 4: el mozo confirmó el pago y la mesa quedó libre.',
            'pago'
        );
        // La lista se vuelve a pedir: el pedido cobrado sale de "Pagos por confirmar".
        expect(pedidoService.listarSinPagar).toHaveBeenCalled();
    });

    it('si el cobro no salió, no avisa a nadie', async () => {
        pedidoService.confirmarPago.mockResolvedValue(false);

        await pagina.onConfirmarPago(pedidoDePrueba());

        expect(notificaciones.enviarAvisos).not.toHaveBeenCalled();
        expect(modal.setOpen).not.toHaveBeenCalledWith('Pago confirmado', expect.anything(), expect.anything());
    });

    // El mozo leería un error como que el pago no salió, y ya salió.
    it('si el aviso falla, no le muestra un error al mozo', async () => {
        const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        pedidoService.confirmarPago.mockResolvedValue(true);
        notificaciones.enviarAvisos.mockRejectedValue(new Error('Error al enviar notificaciones.'));

        await expect(pagina.onConfirmarPago(pedidoDePrueba())).resolves.toBeUndefined();

        expect(modal.setOpen).toHaveBeenCalledTimes(1);
        expect(modal.setOpen).toHaveBeenCalledWith('Pago confirmado', expect.any(String), 'info');
        expect(consola).toHaveBeenCalled();

        consola.mockRestore();
    });
});
