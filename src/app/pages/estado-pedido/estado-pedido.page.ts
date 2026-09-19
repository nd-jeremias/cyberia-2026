import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { DetallePedidoInterface, EstadoItem, PedidoInterface } from '../../interfaces/pedido.interface';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PedidoService } from '../../services/pedido.service';
import { LEYENDA_PAGANDO, LEYENDA_PEDIDO } from '../mi-pedido/mi-pedido.estado';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Cómo se ve cada ítem según en qué punto de la cocina o la barra está. */
const CLASE_ITEM: Record<EstadoItem, string> = {
    Pendiente: 'item-pendiente',
    'En Preparación': 'item-preparando',
    Listo: 'item-listo',
};

/**
 * Seguimiento del pedido (puntos 14, 16, 17 y 18).
 *
 * "Mi pedido" dice en qué estado está el pedido entero. Esta pantalla baja un
 * nivel: cada plato y cada bebida tiene su propio estado, porque cocina y barra
 * los preparan por separado. Así el cliente ve qué ya está listo y qué falta,
 * que es lo que piden los puntos 16 y 17 ("el cliente verifica el cambio de
 * estado en su pedido").
 *
 * Se consulta al entrar y con el botón "Actualizar", igual que "Mi pedido".
 */
@Component({
    selector: 'app-estado-pedido',
    templateUrl: './estado-pedido.page.html',
    // La tarjeta se ve igual que la del mozo y que la de "Mi pedido".
    styleUrls: ['../pedidos/pedidos.page.scss', '../mi-pedido/mi-pedido.page.scss', './estado-pedido.page.scss'],
    imports: [FaIconComponent, IonContent, HeaderComponent],
})
export class EstadoPedidoPage {
    private authService = inject(AuthService);
    private pedidoService = inject(PedidoService);
    private modal = inject(ModalService);
    private router = inject(Router);

    pedidos = signal<PedidoInterface[]>([]);
    cargando = signal(true);

    ionViewWillEnter() {
        void this.recargar();
    }

    async recargar() {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) {
            this.cargando.set(false);
            this.modal.setOpen('Sesión no encontrada', 'Volvé a iniciar sesión para ver tu pedido.');
            return;
        }

        this.cargando.set(true);

        try {
            this.pedidos.set(await this.pedidoService.pedidosActivosDelCliente(usuarioId));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo consultar tu pedido.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.cargando.set(false);
        }
    }

    leyendaDe(pedido: PedidoInterface): string {
        return pedido.estadoCliente === 'pagando' ? LEYENDA_PAGANDO : LEYENDA_PEDIDO[pedido.estado];
    }

    listosDe(pedido: PedidoInterface): number {
        return pedido.detalles.filter((d) => d.estadoProducto === 'Listo').length;
    }

    /** Proporción de ítems listos, para la barra de avance. */
    porcentajeDe(pedido: PedidoInterface): number {
        const total = pedido.detalles.length;

        return total === 0 ? 0 : Math.round((this.listosDe(pedido) / total) * 100);
    }

    /**
     * El avance por ítem recién tiene sentido cuando el pedido bajó a los
     * sectores: antes de que el mozo lo confirme, nadie empezó a prepararlo.
     */
    enPreparacion(pedido: PedidoInterface): boolean {
        return pedido.estado !== 'Pendiente de Confirmación' && pedido.estado !== 'Rechazado';
    }

    claseItem(item: DetallePedidoInterface): string {
        return CLASE_ITEM[item.estadoProducto];
    }

    tiempoEstimado(pedido: PedidoInterface): number {
        return this.pedidoService.tiempoEstimado(pedido);
    }

    irAMiPedido() {
        void this.router.navigate(['/mi-pedido']);
    }
}
