import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PedidoInterface } from '../../interfaces/pedido.interface';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { PedidoService } from '../../services/pedido.service';
import { QrService } from '../../services/qr.service';
import { SpinnerService } from '../../services/spinner.service';
import { PedirCuentaPage } from './pedir-cuenta.page';

function pedidoDePrueba(parcial: Partial<PedidoInterface> = {}): PedidoInterface {
    return {
        id: 'pedido-1',
        mesaId: 'mesa-1',
        numeroMesa: 4,
        clienteId: 'cliente-1',
        estadoCliente: 'sentado',
        estado: 'Recibido',
        precioTotalNeto: 10000,
        descuentoJuego: 0,
        propinaPorcentaje: null,
        fecha: '2026-10-08T20:00:00.000Z',
        detalles: [],
        ...parcial,
    };
}

/**
 * Punto 21: "el cliente solicita la cuenta al mozo (push notification)".
 *
 * Se prueba lo que pasa al abrir la pantalla, sin plantilla y con cada
 * servicio reemplazado por un doble.
 */
describe('PedirCuentaPage (punto 21)', () => {
    const pedidos = { pedidoActualDelCliente: vi.fn<(clienteId: string) => Promise<PedidoInterface | null>>() };
    const notificaciones = { enviarAvisos: vi.fn() };
    const modal = { setOpen: vi.fn() };
    const router = { navigate: vi.fn().mockResolvedValue(true) };

    /** Abre la pantalla: crea la página y corre su ngOnInit. */
    async function abrir(): Promise<PedirCuentaPage> {
        const pagina = TestBed.runInInjectionContext(() => new PedirCuentaPage());

        await pagina.ngOnInit();

        return pagina;
    }

    beforeEach(() => {
        vi.clearAllMocks();
        notificaciones.enviarAvisos.mockResolvedValue(undefined);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: { session: signal({ user: { id: 'cliente-1' } }) } },
                { provide: PedidoService, useValue: pedidos },
                { provide: NotificacionesService, useValue: notificaciones },
                { provide: ModalService, useValue: modal },
                { provide: Router, useValue: router },
                { provide: QrService, useValue: { escanearPayload: vi.fn() } },
                { provide: SpinnerService, useValue: { show: vi.fn(), hide: vi.fn() } },
            ],
        });
    });

    it('al pedir la cuenta, le avisa al mozo con el número de mesa', async () => {
        pedidos.pedidoActualDelCliente.mockResolvedValue(pedidoDePrueba());

        await abrir();

        expect(pedidos.pedidoActualDelCliente).toHaveBeenCalledWith('cliente-1');
        expect(notificaciones.enviarAvisos).toHaveBeenCalledTimes(1);
        expect(notificaciones.enviarAvisos).toHaveBeenCalledWith(
            ['mozo'],
            'Pedido de cuenta',
            expect.stringContaining('Mesa 4'),
            'cuenta-solicitada'
        );
    });

    // Con la propina elegida, el mozo ya pasó por la mesa con los QR.
    it('si ya eligió la propina, no lo vuelve a llamar', async () => {
        pedidos.pedidoActualDelCliente.mockResolvedValue(pedidoDePrueba({ propinaPorcentaje: 10 }));

        const pagina = await abrir();

        expect(pagina.propinaAgregada()).toBe(true);
        expect(notificaciones.enviarAvisos).not.toHaveBeenCalled();
    });

    it('sin un pedido en curso no avisa a nadie', async () => {
        pedidos.pedidoActualDelCliente.mockResolvedValue(null);

        await abrir();

        expect(notificaciones.enviarAvisos).not.toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
    });

    it('si el aviso falla, le pide que llame al mozo', async () => {
        const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        pedidos.pedidoActualDelCliente.mockResolvedValue(pedidoDePrueba());
        notificaciones.enviarAvisos.mockRejectedValue(new Error('Error al enviar notificaciones.'));

        await abrir();

        expect(modal.setOpen).toHaveBeenCalledWith('No pudimos avisarle al mozo', expect.any(String), 'info');

        consola.mockRestore();
    });
});
