import { Component, OnInit, inject } from '@angular/core';
import { IonBadge, IonButton, IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { PedidoInterface } from '../../interfaces/pedido.interface';
import { PedidoService } from '../../services/pedido.service';

/**
 * Pantalla del mozo: confirmar, rechazar y entregar pedidos.
 *
 * Cubre los puntos 13, 14 y 19 del enunciado. Se muestran dos grupos separados
 * porque son dos tareas distintas: revisar lo que el cliente acaba de mandar, y
 * llevar a la mesa lo que los sectores ya terminaron.
 */
@Component({
    selector: 'app-pedidos',
    templateUrl: './pedidos.page.html',
    styleUrls: ['./pedidos.page.scss'],
    imports: [IonContent, IonButton, IonBadge, IonIcon, HeaderComponent],
})
export class PedidosPage implements OnInit {
    private pedidoService = inject(PedidoService);

    pedidos = this.pedidoService.pedidos;
    pendientes = this.pedidoService.pendientesDeConfirmacion;
    listos = this.pedidoService.listosParaEntregar;
    cargando = this.pedidoService.cargando;

    /** Se piden sólo los estados sobre los que el mozo puede actuar. */
    ngOnInit() {
        // El mozo trabaja sobre lo que espera su confirmacion y lo que los
        // sectores ya terminaron (puntos 13, 14 y 19).
        this.pedidoService.listar([
            'Pendiente de Confirmación',
            'Listo para Entregar',
        ]);
    }

    tiempoEstimado(pedido: PedidoInterface): number {
        return this.pedidoService.tiempoEstimado(pedido);
    }

    /**
     * Importe en pesos, sin decimales.
     *
     * El enunciado exige que el total se vea grande y claro; los centavos sólo
     * agregarían ruido a un número que se lee de reojo.
     */
    totalFormateado(pedido: PedidoInterface): string {
        return this.pedidoService
            .totalConDescuento(pedido)
            .toLocaleString('es-AR', {
                style: 'currency',
                currency: 'ARS',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            });
    }

    fechaFormateada(pedido: PedidoInterface): string {
        return new Date(pedido.fecha).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    async onConfirmar(pedido: PedidoInterface) {
        await this.pedidoService.confirmar(pedido.id);
        await this.recargar();
    }

    async onRechazar(pedido: PedidoInterface) {
        await this.pedidoService.rechazar(pedido.id);
        await this.recargar();
    }

    async onEntregar(pedido: PedidoInterface) {
        await this.pedidoService.entregar(pedido.id);
        await this.recargar();
    }

    /**
     * Vuelve a consultar los pedidos contra la base.
     *
     * Se usa tras cada acción y desde el botón "Actualizar" (punto 14): la
     * pantalla carga una sola vez al entrar, y sin ese botón el mozo no vería
     * los pedidos que llegan mientras la tiene abierta. Además, otro mozo pudo
     * haber tocado el mismo pedido mientras tanto.
     */
    recargar(): Promise<void> {
        return this.pedidoService.listar([
            'Pendiente de Confirmación',
            'Listo para Entregar',
        ]);
    }
}
