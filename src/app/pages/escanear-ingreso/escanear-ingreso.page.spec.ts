import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QrPayload } from '../../interfaces/qr.interface';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { QrService } from '../../services/qr.service';
import { SalonService, SituacionCliente } from '../../services/salon.service';
import { SpinnerService } from '../../services/spinner.service';
import { EscanearIngresoPage } from './escanear-ingreso.page';

/**
 * Qué hace el escaneo del QR de ingreso según el momento de la visita.
 *
 * Se prueba la decisión, no el dibujo: la pantalla se crea sin plantilla y
 * cada servicio es un doble, así que ningún test abre la cámara ni sale a la
 * red.
 */
describe('EscanearIngresoPage', () => {
    let pagina: EscanearIngresoPage;

    const salon = {
        situacion: signal<SituacionCliente | null>(null),
        cargarSituacion: vi.fn(),
        acabaDeTerminarSuVisita: vi.fn<() => boolean>(),
        entrarEnListaDeEspera: vi.fn<(usuarioId: string) => Promise<boolean>>(),
    };
    const qr = { escanearPayload: vi.fn<() => Promise<QrPayload | null>>() };
    const modal = { setOpen: vi.fn() };
    const spinner = { show: vi.fn(), hide: vi.fn() };
    const router = { navigate: vi.fn().mockResolvedValue(true) };
    const notificaciones = { enviarAvisos: vi.fn().mockResolvedValue(undefined) };

    beforeEach(() => {
        vi.clearAllMocks();
        salon.situacion.set(null);
        qr.escanearPayload.mockResolvedValue({ tipo: 'ingreso-local' });

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: { session: signal({ user: { id: 'cliente-1' } }) } },
                { provide: SalonService, useValue: salon },
                { provide: QrService, useValue: qr },
                { provide: ModalService, useValue: modal },
                { provide: SpinnerService, useValue: spinner },
                { provide: Router, useValue: router },
                { provide: NotificacionesService, useValue: notificaciones },
            ],
        });

        pagina = TestBed.runInInjectionContext(() => new EscanearIngresoPage());
    });

    it('si acaba de terminar su visita, lo lleva a las encuestas y no lo vuelve a anotar', async () => {
        salon.acabaDeTerminarSuVisita.mockReturnValue(true);

        await pagina.escanear();

        // La situación se relee al escanear: el pago pudo confirmarse recién.
        expect(salon.cargarSituacion).toHaveBeenCalledWith('cliente-1');
        expect(salon.entrarEnListaDeEspera).not.toHaveBeenCalled();
        expect(notificaciones.enviarAvisos).not.toHaveBeenCalled();
        expect(modal.setOpen).toHaveBeenCalledWith('¡Gracias por tu visita!', expect.any(String), 'info');
        expect(router.navigate).toHaveBeenCalledWith(['/encuestas']);
        expect(spinner.hide).toHaveBeenCalled();
    });

    it('pasada la ventana, el mismo escaneo lo anota y avisa al metre', async () => {
        salon.acabaDeTerminarSuVisita.mockReturnValue(false);
        salon.entrarEnListaDeEspera.mockResolvedValue(true);

        await pagina.escanear();

        expect(salon.entrarEnListaDeEspera).toHaveBeenCalledWith('cliente-1');
        expect(modal.setOpen).toHaveBeenCalledWith('Estás en la lista', expect.any(String));
        expect(notificaciones.enviarAvisos).toHaveBeenCalledWith(
            ['metre'],
            expect.any(String),
            expect.any(String),
            'cliente-en-espera'
        );
        expect(router.navigate).not.toHaveBeenCalledWith(['/encuestas']);
    });

    it('si ya estaba anotado, no le vuelve a avisar al metre', async () => {
        salon.acabaDeTerminarSuVisita.mockReturnValue(false);
        salon.entrarEnListaDeEspera.mockResolvedValue(false);

        await pagina.escanear();

        expect(modal.setOpen).toHaveBeenCalledWith('Ya estabas anotado', expect.any(String));
        expect(notificaciones.enviarAvisos).not.toHaveBeenCalled();
    });

    it('con otro código QR no consulta nada', async () => {
        qr.escanearPayload.mockResolvedValue({ tipo: 'mesa', id: 'mesa-1' });

        await pagina.escanear();

        expect(modal.setOpen).toHaveBeenCalledWith('Código incorrecto', expect.any(String));
        expect(salon.cargarSituacion).not.toHaveBeenCalled();
    });

    it('si recién terminó, la leyenda explica desde cuándo puede volver a anotarse', () => {
        salon.situacion.set({ estado: 'libre', mesaId: null, fechaUltimaVisita: '2026-09-30T20:00:00.000Z' });
        salon.acabaDeTerminarSuVisita.mockReturnValue(true);

        expect(pagina.leyenda()).toContain('Tu visita terminó hace poco');
        expect(pagina.leyenda()).toContain('Vas a poder anotarte de nuevo desde el');
    });
});
