import { Component, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { MesaService } from '../../services/mesa.service';
import { ModalService } from '../../services/modal.service';
import { QrService } from '../../services/qr.service';
import { SalonService } from '../../services/salon.service';
import { SpinnerService } from '../../services/spinner.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/**
 * El cliente escanea el QR de su mesa y se sienta (puntos 10 y 11).
 *
 * Las reglas del enunciado se verifican en `SalonService.sentarseEnMesa()`, que
 * las resuelve dentro del propio UPDATE: hay que venir de la lista de espera y
 * la mesa escaneada tiene que ser la asignada. Acá sólo se traduce el resultado
 * a un mensaje, porque esas reglas valen sin importar desde qué pantalla se
 * escanee.
 */
@Component({
    selector: 'app-escanear-mesa',
    templateUrl: './escanear-mesa.page.html',
    styleUrls: ['./escanear-mesa.page.scss'],
    imports: [FaIconComponent, IonContent, HeaderComponent],
})
export class EscanearMesaPage {
    private authService = inject(AuthService);
    private salonService = inject(SalonService);
    private mesaService = inject(MesaService);
    private qrService = inject(QrService);
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);
    private router = inject(Router);

    situacion = this.salonService.situacion;

    /** Número de la mesa que le asignó el metre, para poder indicárselo. */
    numeroMesa = computed(() => {
        const mesaId = this.situacion()?.mesaId;

        if (!mesaId) return null;

        return this.mesaService.mesas().find((m) => m.id === mesaId)?.numeroMesa ?? null;
    });

    constructor() {
        // Al sentarse, esta pantalla ya no tiene nada que ofrecer: se vuelve al
        // inicio, que muestra la carta y el resto de los accesos. `replaceUrl`
        // evita que el botón de atrás traiga de nuevo el lector.
        effect(() => {
            if (this.situacion()?.estado === 'sentado') {
                void this.router.navigate(['/inicio'], { replaceUrl: true });
            }
        });
    }

    async ionViewWillEnter() {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) return;

        try {
            await this.salonService.cargarSituacion(usuarioId);
            await this.mesaService.listar();
        } catch (error) {
            this.avisar(error, 'No se pudo consultar tu mesa.');
        }
    }

    async escanear() {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) {
            this.modal.setOpen('Sesión no encontrada', 'Volvé a iniciar sesión para continuar.');
            return;
        }

        try {
            const payload = await this.qrService.escanearPayload();

            // Canceló el lector.
            if (!payload) return;

            if (payload.tipo !== 'mesa') {
                this.modal.setOpen(
                    'Código incorrecto',
                    'Ese no es el código de una mesa. Buscá el que está sobre tu mesa.'
                );
                return;
            }

            this.spinner.show();

            // Si el mozo acaba de confirmar el pago, hay que saberlo antes de
            // decidir qué hace este escaneo.
            await this.salonService.cargarSituacion(usuarioId);

            // Recién terminó su visita: no se lo vuelve a sentar, se le muestra
            // cómo quedó la mesa y va a las encuestas (punto 22).
            if (this.salonService.acabaDeTerminarSuVisita()) {
                await this.verificarMesaLiberada(payload.id);
                return;
            }

            const sentado = await this.salonService.sentarseEnMesa(usuarioId, payload.id);

            if (sentado) return; // El efecto de arriba se encarga de navegar.

            // No se pudo: o escaneó otra mesa, o todavía no tiene ninguna.
            const numero = this.numeroMesa();

            this.modal.setOpen(
                'Esa no es tu mesa',
                numero !== null
                    ? `Tu mesa asignada es la N° ${numero}. Escaneá el código que está sobre esa mesa.`
                    : 'Todavía no tenés una mesa asignada. Esperá a que el metre te ubique.'
            );
        } catch (error) {
            this.avisar(error, 'No se pudo leer el código de la mesa.');
        } finally {
            this.spinner.hide();
        }
    }

    /**
     * Punto 22: "verificar que la mesa esté libre nuevamente (haciendo que el
     * cliente vuelva a escanear el QR de la mesa)".
     *
     * Se consulta la mesa en la base en lugar de suponerla libre, porque eso
     * es justamente lo que el enunciado pide comprobar. Después, igual que el
     * QR de ingreso, lo lleva a las encuestas.
     */
    private async verificarMesaLiberada(mesaId: string): Promise<void> {
        await this.mesaService.listar();

        const mesa = this.mesaService.mesas().find((m) => m.id === mesaId);

        if (mesa?.disponibilidad === 'Disponible') {
            this.modal.setOpen(
                'La mesa quedó libre',
                `La mesa N° ${mesa.numeroMesa} ya está disponible para otros clientes. ¡Gracias por tu visita! Te llevamos a las encuestas.`,
                'info'
            );
        } else {
            this.modal.setOpen(
                'Tu visita terminó',
                'Esta mesa ya no está a tu nombre. ¡Gracias por tu visita! Te llevamos a las encuestas.',
                'info'
            );
        }

        void this.router.navigate(['/encuestas']);
    }

    private avisar(error: unknown, alternativa: string) {
        const mensaje = error instanceof Error ? error.message : alternativa;

        this.modal.setOpen('Error', mensaje, 'error');
    }
}
