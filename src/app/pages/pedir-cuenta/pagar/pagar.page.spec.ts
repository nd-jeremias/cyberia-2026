import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { SalonService } from '../../../services/salon.service';
import { SpinnerService } from '../../../services/spinner.service';
import { PagarPage } from './pagar.page';

/**
 * Punto 21: el cliente paga y queda esperando que el mozo lo confirme.
 *
 * Es el paso que habilita el punto 22: sin el estado 'pagando', el mozo no ve
 * el cobro en "Pagos por confirmar". El cobro con tarjeta es simulado con una
 * espera; acá se la adelanta con relojes falsos.
 */
describe('PagarPage (punto 21)', () => {
    let pagina: PagarPage;

    const salon = { pagarCuenta: vi.fn<(usuarioId: string) => Promise<boolean>>() };
    const notificaciones = { enviarAvisos: vi.fn() };
    const modal = { setOpen: vi.fn() };
    const spinner = { show: vi.fn(), hide: vi.fn() };
    const router = { navigate: vi.fn().mockResolvedValue(true) };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        notificaciones.enviarAvisos.mockResolvedValue(undefined);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: { session: signal({ user: { id: 'cliente-1' } }) } },
                { provide: SalonService, useValue: salon },
                { provide: NotificacionesService, useValue: notificaciones },
                { provide: ModalService, useValue: modal },
                { provide: SpinnerService, useValue: spinner },
                { provide: Router, useValue: router },
            ],
        });

        pagina = TestBed.runInInjectionContext(() => new PagarPage());
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    /** Paga y deja correr la espera que simula el cobro con la tarjeta. */
    async function pagar(): Promise<void> {
        const pago = pagina.pagar();

        await vi.advanceTimersByTimeAsync(2500);
        await pago;
    }

    // "La notificación automática la recibirá tanto el mozo como el dueño y el
    // supervisor."
    it('deja al cliente "pagando", avisa al mozo, al dueño y al supervisor, y vuelve al inicio', async () => {
        salon.pagarCuenta.mockResolvedValue(true);

        await pagar();

        expect(salon.pagarCuenta).toHaveBeenCalledWith('cliente-1');
        expect(notificaciones.enviarAvisos).toHaveBeenCalledWith(
            ['mozo', 'dueño', 'supervisor'],
            'Pago realizado',
            expect.any(String),
            'pago'
        );
        expect(modal.setOpen).toHaveBeenCalledWith('Pago realizado', expect.any(String), 'info');
        expect(router.navigate).toHaveBeenCalledWith(['/inicio']);
        expect(spinner.hide).toHaveBeenCalled();
    });

    it('si no estaba sentado, se lo explica y no avisa al mozo', async () => {
        salon.pagarCuenta.mockResolvedValue(false);

        await pagar();

        expect(modal.setOpen).toHaveBeenCalledWith('Pago no registrado', expect.any(String), 'error');
        expect(notificaciones.enviarAvisos).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    // El pago ya quedó registrado y el mozo lo ve igual en su pantalla: se
    // avisa que falló la notificación, no el pago.
    it('si falla el aviso, lo dice y vuelve al inicio igual', async () => {
        const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        salon.pagarCuenta.mockResolvedValue(true);
        notificaciones.enviarAvisos.mockRejectedValue(new Error('Error al enviar notificaciones.'));

        await pagar();

        expect(modal.setOpen).toHaveBeenCalledWith('Error', 'No se pudo avisar del pago al mozo', 'error');
        expect(modal.setOpen).not.toHaveBeenCalledWith('Pago no registrado', expect.anything(), expect.anything());
        expect(router.navigate).toHaveBeenCalledWith(['/inicio']);

        consola.mockRestore();
    });

    it('sin sesión no cobra nada', async () => {
        TestBed.inject(AuthService).session.set(null);

        await pagar();

        expect(salon.pagarCuenta).not.toHaveBeenCalled();
        expect(modal.setOpen).toHaveBeenCalledWith('Sesión no encontrada', expect.any(String));
    });
});
