import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { PedidoInterface } from '../../interfaces/pedido.interface';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PedidoService } from '../../services/pedido.service';
import { LEYENDA_PEDIDO, puedeAccederAJuegos } from './mi-pedido.estado';

/** Ruta de la sección de juegos (punto 15), que se desarrolla en otra rama. */
const RUTA_JUEGOS = 'juegos';

/**
 * Pedido del cliente: en qué estado está y qué puede hacer mientras espera.
 *
 * Cubre, del lado del cliente, los puntos 13 a 15: ver si el mozo todavía lo
 * revisa, si lo rechazó o si ya lo confirmó; volver a consultarlo sin salir de
 * la pantalla, y entrar a los juegos cuando corresponde.
 *
 * La pantalla sólo lee: el pedido lo cambian el mozo y los sectores.
 */
@Component({
    selector: 'app-mi-pedido',
    templateUrl: './mi-pedido.page.html',
    // La tarjeta se ve igual que la del mozo: se reutilizan sus estilos en vez
    // de copiarlos.
    styleUrls: ['../pedidos/pedidos.page.scss', './mi-pedido.page.scss'],
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class MiPedidoPage {
    private authService = inject(AuthService);
    private pedidoService = inject(PedidoService);
    private modal = inject(ModalService);
    private router = inject(Router);

    pedido = signal<PedidoInterface | null>(null);
    cargando = signal(true);

    leyenda = computed(() => {
        const pedido = this.pedido();

        return pedido ? LEYENDA_PEDIDO[pedido.estado] : '';
    });

    rechazado = computed(() => this.pedido()?.estado === 'Rechazado');

    puedeJugar = computed(() => puedeAccederAJuegos(this.pedido()?.estado ?? null, this.authService.perfil()));

    /** Se consulta cada vez que se entra: el estado cambia mientras el cliente espera. */
    ionViewWillEnter() {
        void this.recargar();
    }

    /** Punto 14: vuelve a pedir el pedido a la base, para ver si el mozo ya lo confirmó. */
    async recargar() {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) {
            this.cargando.set(false);
            this.modal.setOpen('Sesión no encontrada', 'Volvé a iniciar sesión para ver tu pedido.');
            return;
        }

        this.cargando.set(true);

        try {
            this.pedido.set(await this.pedidoService.pedidoActualDelCliente(usuarioId));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo consultar tu pedido.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.cargando.set(false);
        }
    }

    tiempoEstimado(pedido: PedidoInterface): number {
        return this.pedidoService.tiempoEstimado(pedido);
    }

    totalFormateado(pedido: PedidoInterface): string {
        return this.pedidoService.totalConDescuento(pedido).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    /**
     * Punto 15: lleva a la sección de juegos.
     *
     * Mientras la ruta no exista en esta rama se avisa, en lugar de dejar un
     * botón que no hace nada.
     */
    irAJuegos() {
        const existe = this.router.config.some((ruta) => ruta.path === RUTA_JUEGOS);

        if (!existe) {
            this.modal.setOpen('Juegos', 'La sección de juegos todavía no está habilitada.', 'info');
            return;
        }

        void this.router.navigate(['/', RUTA_JUEGOS]);
    }
}
