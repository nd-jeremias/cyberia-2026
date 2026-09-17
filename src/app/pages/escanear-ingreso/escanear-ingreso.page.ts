import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { EstadoEnResto } from '../../interfaces/auth.interface';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { QrService } from '../../services/qr.service';
import { SalonService } from '../../services/salon.service';
import { SpinnerService } from '../../services/spinner.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Qué decirle al cliente según dónde esté parado en el circuito. */
const LEYENDA_ESTADO: Record<EstadoEnResto, string> = {
    libre: 'Todavía no estás anotado. Escaneá el código QR de la entrada para pedir una mesa.',
    esperando_mesa: 'Ya estás en la lista de espera. El metre te va a asignar una mesa en breve.',
    mesa_asignada: 'Ya tenés una mesa asignada. Escaneá el código QR de tu mesa para ver la carta.',
    sentado: 'Estás en tu mesa. Desde el inicio podés ver la carta y el estado de tu pedido.',
    pagando: 'Pediste la cuenta. Esperá la confirmación del mozo.',
};

/**
 * Ingreso al local escaneando el QR de la entrada (punto 9 del enunciado).
 *
 * El escaneo no abre solo al entrar a la pantalla: se dispara con un botón. Una
 * cámara que arranca sola es difícil de cancelar y desconcierta, sobre todo
 * cuando el cliente entra sin querer desde el inicio.
 */
@Component({
    selector: 'app-escanear-ingreso',
    templateUrl: './escanear-ingreso.page.html',
    styleUrls: ['./escanear-ingreso.page.scss'],
    imports: [IonContent, FaIconComponent, HeaderComponent],
})
export class EscanearIngresoPage {
    private authService = inject(AuthService);
    private salonService = inject(SalonService);
    private qrService = inject(QrService);
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);
    private router = inject(Router);

    situacion = this.salonService.situacion;

    estado = computed<EstadoEnResto>(() => this.situacion()?.estado ?? 'libre');
    leyenda = computed(() => LEYENDA_ESTADO[this.estado()]);
    puedeAnotarse = computed(() => this.estado() === 'libre');

    /** Se apaga en cuanto se conoce la situación, para no mostrar datos viejos. */
    cargando = signal(true);

    constructor() {
        // El metre asigna la mesa desde otro teléfono y el aviso llega por
        // Realtime. En ese momento esta pantalla ya no tiene nada que ofrecer:
        // se vuelve al inicio, donde aparece el acceso para escanear la mesa.
        //
        // `replaceUrl` saca esta pantalla del historial: el botón de atrás no
        // debe traer de nuevo el lector del ingreso cuando el cliente ya está
        // adentro del local.
        effect(() => {
            const estado = this.situacion()?.estado;

            if (!estado || estado === 'libre' || estado === 'esperando_mesa') return;

            void this.router.navigate(['/inicio'], { replaceUrl: true });
        });
    }

    async ionViewWillEnter() {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) return;

        try {
            await this.salonService.cargarSituacion(usuarioId);
        } catch (error) {
            this.avisarError(error, 'No se pudo consultar tu estado en el local.');
        } finally {
            this.cargando.set(false);
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

            if (payload.tipo !== 'ingreso-local') {
                this.modal.setOpen(
                    'Código incorrecto',
                    'Ese no es el código de ingreso al local. Buscá el que está en la puerta.'
                );
                return;
            }

            this.spinner.show();

            const anotado = await this.salonService.entrarEnListaDeEspera(usuarioId);

            this.modal.setOpen(
                anotado ? 'Estás en la lista' : 'Ya estabas anotado',
                anotado
                    ? 'Te anotamos en la lista de espera. Aguardá a que el metre te asigne una mesa.'
                    : LEYENDA_ESTADO[this.estado()]
            );
        } catch (error) {
            this.avisarError(error, 'No se pudo completar el ingreso al local.');
        } finally {
            this.spinner.hide();
        }
    }

    private avisarError(error: unknown, alternativa: string) {
        const mensaje = error instanceof Error ? error.message : alternativa;

        this.modal.setOpen('Error', mensaje);
    }
}
