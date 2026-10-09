import { TarjetaInformacionClienteComponent } from './../../components/tarjeta-informacion-cliente/tarjeta-informacion-cliente.component';
import { Router } from '@angular/router';
import { Component, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { BotonHomeComponent } from '../../components/boton-home/boton-home.component';
import { BotonHomeInterface } from '../../interfaces/component.interface';
import { QrService } from '../../services/qr.service';
import { ModalService } from '../../services/modal.service';
import { SpinnerService } from '../../services/spinner.service';
import { PedidoService } from '../../services/pedido.service';
import { QrPropina } from '../../interfaces/qr.interface';
import { PedidoInterface } from '../../interfaces/pedido.interface';
import { TarjetaFacturaComponent } from '../../components/tarjeta-factura/tarjeta-factura.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../services/auth.service';
import { SalonService } from '../../services/salon.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { SalonService } from '../../services/salon.service';

/**
 * Pedir la cuenta — PANTALLA PENDIENTE.
 *
 * Punto 21: propina por QR y detalle de la cuenta.
 *
 * Qué se puede reusar: QrService.escanearPayload() ya interpreta el QR de propina.
 *
 * Está creada como armazón para que el acceso del inicio ya lleve a algún
 * lado: así se puede recorrer el circuito completo del cliente mientras cada
 * pantalla se completa por separado.
 */
@Component({
    selector: 'app-pedir-cuenta',
    templateUrl: './pedir-cuenta.page.html',
    styleUrls: ['./pedir-cuenta.page.scss'],
    imports: [
        TarjetaInformacionClienteComponent,
        FaIconComponent,
        IonContent,
        HeaderComponent,
        BotonHomeComponent,
        TarjetaFacturaComponent,
    ],
})
export class PedirCuentaPage {
    qrService = inject(QrService);
    modal = inject(ModalService);
    spinner = inject(SpinnerService);
    pedidoService = inject(PedidoService);
    authService = inject(AuthService);
    router = inject(Router);
    notificaciones = inject(NotificacionesService);
    salonService = inject(SalonService);
    salonService = inject(SalonService);

    pedido = signal<PedidoInterface | null>(null);
    propinaAgregada = signal<boolean>(false);

    texto = `
        Antes de continuar, debe seleccionar la propina que desea dejar. 
        \nPara esto es necesario escanear el QR correspondiente.
        \nSi no lo encuentra en la mesa, por favor pídaselo a su mozo. `;

    botonPropina: BotonHomeInterface = {
        texto: 'Agregar propina',
        icono: 'circle-dollar-to-slot',
        accion: () => this.scanQrPropina(),
    };

    async ngOnInit() {
        this.spinner.show();
        try {
            const pedido_cliente = await this.pedidoService.pedidoActualDelCliente(
                this.authService.session()?.user.id!
            );

            if (!pedido_cliente) {
                this.modal.setOpen('Error', 'Hubo un error al cargar su pedido. Vuelva a intentarlo.', 'error');
                this.router.navigate(['/inicio']);
            }
            this.pedido.set(pedido_cliente);

            if (this.pedido()?.propinaPorcentaje) this.propinaAgregada.set(true);

            // Con la propina ya elegida, el mozo ya pasó por la mesa con los QR.
            // if (pedido_cliente && !this.propinaAgregada()) await this.avisarAlMozo(pedido_cliente);
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Punto 21: "el cliente solicita la cuenta al mozo (push notification)".
     *
     * Abrir esta pantalla es pedir la cuenta. El mozo recibe el número de mesa
     * para acercarle los QR de propina, sin los que no se puede armar la cuenta.
     *
     * Si el aviso falla, el cliente igual puede seguir: se le pide que llame al
     * mozo, que es lo que el aviso habría hecho por él.
     */
    // private async avisarAlMozo(pedido: PedidoInterface): Promise<void> {
    //     try {
    //         await this.notificaciones.enviarAvisos(
    //             ['mozo'],
    //             'Pedido de cuenta',
    //             `Mesa ${pedido.numeroMesa}: el cliente pidió la cuenta. Acercale los QR de propina.`,
    //             'cuenta-solicitada'
    //         );
    //     } catch (error) {
    //         console.error('No se pudo avisar al mozo del pedido de cuenta:', error);
    //         this.modal.setOpen(
    //             'No pudimos avisarle al mozo',
    //             'Llamalo para pedirle la cuenta y los códigos QR de propina.',
    //             'info'
    //         );
    //     }
    // }

    async scanQrPropina() {
        try {
            const response = (await this.qrService.escanearPayload()) as QrPropina;

            if (!response) {
                console.log('SIN RESPUESTA');
                return;
            } // Canceló el lector.

            if (response.tipo !== 'propina') {
                this.modal.setOpen(
                    'Código incorrecto',
                    'Ese no es el código para dejar propina. Verificalo con el mozo.'
                );
                return;
            }

            const propina = response.porcentaje;

            this.spinner.show();

            let pedidoId: string;

            if (this.pedido() != null) {
                pedidoId = this.pedido()?.id!;
                if (!pedidoId) throw new Error('Error obteniendo el pedido. No se puede actualizar.');

                const seActualizoPropina = await this.pedidoService.setPropina(pedidoId, propina);

                if (seActualizoPropina) {
                    this.pedido.update((pedidoActual) => {
                        if (!pedidoActual) return null;
                        return {
                            ...pedidoActual,
                            propinaPorcentaje: propina,
                        };
                    });
                }
            }

            this.propinaAgregada.set(true);
        } catch (error) {
            console.log(error);
            const mensaje = error instanceof Error ? error.message : 'No se pudo asignar propina al pedido.';

            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }

    async pagar() {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) {
            this.modal.setOpen('Sesión no encontrada', 'Volvé a iniciar sesión para continuar.');
            return;
        }

        this.spinner.show();

        try {
            // El pago es simulado: la espera representa el cobro con la tarjeta.
            await new Promise((resolve) => setTimeout(resolve, 2500));

            // Punto 21: el cliente queda "pagando" hasta que el mozo confirme.
            // Sin este paso el mozo no ve el cobro en "Pagos por confirmar" y
            // el punto 22 no se puede completar nunca.
            const pagado = await this.salonService.pagarCuenta(usuarioId);

            if (!pagado) {
                this.modal.setOpen('Pago no registrado', 'Si ya pagaste, esperá la confirmación del mozo.', 'error');
                return;
            }

            await this.avisarAlMozo();

            this.router.navigate(['/inicio']);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo realizar el pago.';
            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }

    /**
     * Si el aviso falla, el pago ya quedó registrado y el mozo lo ve igual en
     * su pantalla: no se le muestra al cliente un error que parezca un cobro
     * rechazado.
     */
    private async avisarAlMozo(): Promise<void> {
        try {
            
            await this.notificaciones.enviarAvisos(
                ['mozo'],
                'Pago realizado',
                `El cliente de la mesa ${this.pedido()?.numeroMesa} realizó el pago. Confirma la recepción.`,
                'pago'
            );
            this.modal.setOpen(
                'Pago realizado',
                'Se envió una notificacion al mozo. Espera que confirme tu pago.',
                'info'
            );
        } catch (error) {
            console.error('No se pudo avisar el pago al mozo:', error);
            this.modal.setOpen('Error', 'No se pudo avisar del pago al mozo', 'error');
        }
    }
}
