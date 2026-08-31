import { Component, OnInit, inject } from '@angular/core';
import {
    IonBadge,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
} from '@ionic/angular';
import { PedidoInterface } from '../../interfaces/pedido.interface';
import { PedidoService } from '../../services/pedido.service';

@Component({
    selector: 'app-pedidos',
    templateUrl: './pedidos.page.html',
    styleUrls: ['./pedidos.page.scss'],
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButton,
        IonBadge,
        IonIcon,
    ],
})
export class PedidosPage implements OnInit {
    private pedidoService = inject(PedidoService);

    pedidos = this.pedidoService.pedidos;
    pendientes = this.pedidoService.pendientesDeConfirmacion;
    listos = this.pedidoService.listosParaEntregar;
    cargando = this.pedidoService.cargando;

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

    private recargar(): Promise<void> {
        return this.pedidoService.listar([
            'Pendiente de Confirmación',
            'Listo para Entregar',
        ]);
    }
}
