import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { DetallePedidoInterface, EstadoItem, PedidoInterface } from '../../interfaces/pedido.interface';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PedidoService } from '../../services/pedido.service';
import { SpinnerService } from '../../services/spinner.service';
import { LEYENDA_PAGANDO, LEYENDA_PEDIDO, puedeConfirmarRecepcion } from '../mi-pedido/mi-pedido.estado';
import { formatearFechaHora } from '../../utils/fecha';
import { formatearImporte } from '../../utils/importe';
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
    private spinner = inject(SpinnerService);
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
        this.spinner.show();

        try {
            this.pedidos.set(await this.pedidoService.pedidosActivosDelCliente(usuarioId));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo consultar tu pedido.';

            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.cargando.set(false);
            this.spinner.hide();
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

    /**
     * Punto 19: el mozo marcó el pedido como entregado y falta que el cliente
     * confirme que lo recibió.
     *
     * El botón vive acá y no sólo en "Mi pedido": una vez que el mozo confirma
     * el pedido, esa pantalla deja de estar al alcance del cliente, y sin esto
     * la visita quedaba trabada —sin recepción no hay encuesta ni cuenta, y el
     * mozo tampoco veía nada para cobrar.
     */
    puedeConfirmar(pedido: PedidoInterface): boolean {
        return puedeConfirmarRecepcion(pedido.estado);
    }

    async confirmarRecepcion(pedido: PedidoInterface) {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) return;

        const confirmado = await this.pedidoService.confirmarRecepcion(pedido.id, usuarioId);

        // Se vuelve a leer también si falló: puede que el estado haya cambiado.
        await this.recargar();

        if (confirmado) {
            this.modal.setOpen('Pedido recibido', 'Ya podés responder la encuesta y pedir la cuenta.', 'info');
        }
    }

    /** Puntos 16 y 17: la fecha del pedido, con hora y minutos. */
    fechaDe(pedido: PedidoInterface): string {
        return formatearFechaHora(pedido.fecha);
    }

    /** Lo que vale cada línea: cantidad por precio unitario (punto 21). */
    importeDeLinea(item: DetallePedidoInterface): string {
        return formatearImporte(item.precioTotalParcial);
    }

    precioUnitarioDe(item: DetallePedidoInterface): string {
        return formatearImporte(item.precioUnitario);
    }

    /** Punto 12: el importe del pedido, siempre a la vista. */
    totalDe(pedido: PedidoInterface): string {
        return formatearImporte(this.pedidoService.totalConDescuento(pedido));
    }

    /** Sólo se muestra si el cliente ganó un descuento en los juegos (punto 15). */
    descuentoDe(pedido: PedidoInterface): number {
        return pedido.descuentoJuego;
    }

    /** Suma de todos los pedidos de la visita: lo que va a pagar (punto 21). */
    totalDeLaVisita = computed(() =>
        formatearImporte(
            this.pedidos().reduce((suma, pedido) => suma + this.pedidoService.totalConDescuento(pedido), 0)
        )
    );

    /**
     * Sin pedidos todavía: se manda a la carta y no a "Mi pedido", que es el
     * paso siguiente de elegir y no tiene sentido con el carrito vacío.
     */
    irALaCarta() {
        void this.router.navigate(['/carta']);
    }
}
