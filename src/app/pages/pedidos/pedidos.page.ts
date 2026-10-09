import { Component, OnInit, inject } from '@angular/core';
import { IonBadge, IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { PedidoInterface } from '../../interfaces/pedido.interface';
import { ModalService } from '../../services/modal.service';
import { formatearImporte } from '../../utils/importe';
import { PedidoService } from '../../services/pedido.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NotificacionesService } from '../../services/notificaciones.service';
import { SalonService } from '../../services/salon.service';
``

/**
 * Pantalla del mozo: confirmar, rechazar, entregar y cobrar pedidos.
 *
 * Cubre los puntos 13, 14, 19 y 22 del enunciado. Se muestran tres grupos
 * separados porque son tres tareas distintas: revisar lo que el cliente acaba
 * de mandar, llevar a la mesa lo que los sectores ya terminaron y confirmar el
 * pago de quien ya pagó.
 */
@Component({
    selector: 'app-pedidos',
    templateUrl: './pedidos.page.html',
    styleUrls: ['./pedidos.page.scss'],
    imports: [IonContent, FaIconComponent, IonContent, IonBadge, HeaderComponent],
})
export class PedidosPage implements OnInit {
    private pedidoService = inject(PedidoService);
    private modal = inject(ModalService);
    private notificaciones = inject(NotificacionesService);
    private salonService = inject(SalonService);

    pedidos = this.pedidoService.pedidos;
    pendientes = this.pedidoService.pendientesDeConfirmacion;
    listos = this.pedidoService.listosParaEntregar;
    pagos = this.pedidoService.pagosPorConfirmar;
    cargando = this.pedidoService.cargando;

    ngOnInit() {
        void this.recargar();
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
        return formatearImporte(this.pedidoService.totalConDescuento(pedido));
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
        // Verificamos qué sectores tienen productos en este pedido
        const tieneComida = pedido.detalles.some((d) => d.tipoProducto !== 'Bebida');
        const tieneBebida = pedido.detalles.some((d) => d.tipoProducto === 'Bebida');

        const sectores: string[] = [];
        if (tieneComida) sectores.push('cocinero');
        if (tieneBebida) sectores.push('cantinero');

        if (sectores.length > 0) {
            void this.notificaciones.enviarAvisos(
                sectores,
                `Nuevo pedido - Mesa ${pedido.numeroMesa}`,
                'Hay nuevos productos pendientes de elaboración.',
                'pedido-nuevo'
            );
        }
        await this.recargar();
    }

    async onRechazar(pedido: PedidoInterface) {
        await this.notificaciones.enviarAvisoAUsuario(
            pedido.clienteId,
            'Pedido rechazado.',
            'Su pedido ha sido rechazado, realize cambios y vuelva a pedir. ',
            'pedido-estado'
        );
        await this.pedidoService.rechazar(pedido.id);
        await this.recargar();
    }

    // Punto 19: el pedido queda "Entregado" hasta que el cliente confirma.
    async onEntregar(pedido: PedidoInterface) {
        await this.pedidoService.entregar(pedido.id);
        await this.recargar();
    }

    // Punto 22: se cobra, se libera la mesa y el cliente queda libre.
    async onConfirmarPago(pedido: PedidoInterface) {
        const cobrado = await this.pedidoService.confirmarPago(pedido);

        await this.recargar();

        if (!cobrado) return;

        this.salonService.acabaDeTerminarSuVisita();
        
        this.modal.setOpen('Pago confirmado', `La mesa ${pedido.numeroMesa} quedó libre.`, 'info');

        await this.avisarPagoConfirmado(pedido);
    }

    /**
     * Punto 22: "luego de la confirmación de pago, la notificación automática
     * llega al dueño y al supervisor".
     *
     * Si el aviso falla, el cobro ya quedó registrado y la mesa libre: no se le
     * muestra un error al mozo, que lo leería como que el pago no salió.
     */
    private async avisarPagoConfirmado(pedido: PedidoInterface): Promise<void> {
        try {
            await this.notificaciones.enviarAvisos(
                ['dueño', 'supervisor'],
                'Pago confirmado',
                `Mesa ${pedido.numeroMesa}: el mozo confirmó el pago y la mesa quedó libre.`,
                'pago'
            );
        } catch (error) {
            console.error('No se pudo avisar el pago al dueño y al supervisor:', error);
        }
    }

    /**
     * Vuelve a consultar los pedidos contra la base.
     *
     * Se usa tras cada acción y desde el botón "Actualizar" (punto 14): la
     * pantalla carga una sola vez al entrar, y sin ese botón el mozo no vería
     * los pedidos que llegan mientras la tiene abierta. Además, otro mozo pudo
     * haber tocado el mismo pedido mientras tanto.
     *
     * Trae todo lo que no está pagado y cada grupo filtra lo suyo: el de pagos
     * depende del estado del cliente, no sólo del pedido.
     */
    recargar(): Promise<void> {
        return this.pedidoService.listarSinPagar();
    }
}
