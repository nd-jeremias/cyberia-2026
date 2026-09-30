import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MesaInterface } from '../../interfaces/mesa.interface';
import { QrPayload } from '../../interfaces/qr.interface';
import { AuthService } from '../../services/auth.service';
import { MesaService } from '../../services/mesa.service';
import { ModalService } from '../../services/modal.service';
import { QrService } from '../../services/qr.service';
import { SalonService, SituacionCliente } from '../../services/salon.service';
import { SpinnerService } from '../../services/spinner.service';
import { EscanearMesaPage } from './escanear-mesa.page';

function mesaDePrueba(parcial: Partial<MesaInterface> = {}): MesaInterface {
    return {
        id: 'mesa-1',
        numeroMesa: 4,
        cantidadLugares: 4,
        tipo: 'Estándar',
        disponibilidad: 'Disponible',
        clienteId: null,
        qrUrl: 'https://ejemplo/qr.png',
        fotoUrl: 'https://ejemplo/mesa.png',
        ...parcial,
    };
}

/**
 * Punto 22: "verificar que la mesa esté libre nuevamente (haciendo que el
 * cliente vuelva a escanear el QR de la mesa)".
 *
 * Se prueba la decisión, no el dibujo: la pantalla se crea sin plantilla y
 * cada servicio es un doble.
 */
describe('EscanearMesaPage', () => {
    let pagina: EscanearMesaPage;

    /** Cómo está la mesa en la base cuando la pantalla la consulta. */
    let mesaEnBase: MesaInterface;

    const salon = {
        situacion: signal<SituacionCliente | null>(null),
        cargarSituacion: vi.fn(),
        acabaDeTerminarSuVisita: vi.fn<() => boolean>(),
        sentarseEnMesa: vi.fn<(usuarioId: string, mesaId: string) => Promise<boolean>>(),
    };
    const mesas = {
        mesas: signal<MesaInterface[]>([]),
        listar: vi.fn(async () => {
            mesas.mesas.set([mesaEnBase]);
            return [mesaEnBase];
        }),
    };
    const qr = { escanearPayload: vi.fn<() => Promise<QrPayload | null>>() };
    const modal = { setOpen: vi.fn() };
    const router = { navigate: vi.fn().mockResolvedValue(true) };

    beforeEach(() => {
        vi.clearAllMocks();
        salon.situacion.set(null);
        mesas.mesas.set([]);
        mesaEnBase = mesaDePrueba();
        qr.escanearPayload.mockResolvedValue({ tipo: 'mesa', id: 'mesa-1' });

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: { session: signal({ user: { id: 'cliente-1' } }) } },
                { provide: SalonService, useValue: salon },
                { provide: MesaService, useValue: mesas },
                { provide: QrService, useValue: qr },
                { provide: ModalService, useValue: modal },
                { provide: SpinnerService, useValue: { show: vi.fn(), hide: vi.fn() } },
                { provide: Router, useValue: router },
            ],
        });

        pagina = TestBed.runInInjectionContext(() => new EscanearMesaPage());
    });

    describe('con la visita recién terminada', () => {
        beforeEach(() => {
            salon.acabaDeTerminarSuVisita.mockReturnValue(true);
        });

        it('consulta la mesa en la base, confirma que quedó libre y va a las encuestas', async () => {
            await pagina.escanear();

            expect(salon.cargarSituacion).toHaveBeenCalledWith('cliente-1');
            // Lo que se muestra sale de la base, no de suponerla libre.
            expect(mesas.listar).toHaveBeenCalled();
            expect(modal.setOpen).toHaveBeenCalledWith(
                'La mesa quedó libre',
                expect.stringContaining('N° 4'),
                'info'
            );
            expect(router.navigate).toHaveBeenCalledWith(['/encuestas']);
        });

        it('no lo vuelve a sentar', async () => {
            await pagina.escanear();

            expect(salon.sentarseEnMesa).not.toHaveBeenCalled();
        });

        // Por ejemplo, si el metre ya se la dio a otro cliente.
        it('si la mesa ya no figura libre, igual cierra la visita y va a las encuestas', async () => {
            mesaEnBase = mesaDePrueba({ disponibilidad: 'Ocupada', clienteId: 'otro-cliente' });

            await pagina.escanear();

            expect(modal.setOpen).toHaveBeenCalledWith('Tu visita terminó', expect.any(String), 'info');
            expect(router.navigate).toHaveBeenCalledWith(['/encuestas']);
        });
    });

    it('en una visita en curso lo sienta como siempre', async () => {
        salon.acabaDeTerminarSuVisita.mockReturnValue(false);
        salon.sentarseEnMesa.mockResolvedValue(true);

        await pagina.escanear();

        expect(salon.sentarseEnMesa).toHaveBeenCalledWith('cliente-1', 'mesa-1');
        expect(router.navigate).not.toHaveBeenCalledWith(['/encuestas']);
    });
});
