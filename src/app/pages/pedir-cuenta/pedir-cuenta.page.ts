import { TarjetaInformacionClienteComponent } from './../../components/tarjeta-informacion-cliente/tarjeta-informacion-cliente.component';
import { Router, RouterLink } from '@angular/router';
import { Component, inject, signal } from '@angular/core';
import { IonContent, IonIcon, IonRouterLink } from '@ionic/angular';
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
        RouterLink,
        FaIconComponent,
        IonContent,
        HeaderComponent,
        BotonHomeComponent,
        TarjetaFacturaComponent,
        IonRouterLink,
    ],
})
export class PedirCuentaPage {
    qrService = inject(QrService);
    modal = inject(ModalService);
    spinner = inject(SpinnerService);
    pedidoService = inject(PedidoService);
    authService = inject(AuthService);
    router = inject(Router);

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
        } catch (error) {
            console.log(error);
        } finally {
            this.spinner.hide();
        }
    }

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
}
