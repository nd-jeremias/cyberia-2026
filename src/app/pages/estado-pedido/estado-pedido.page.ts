import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

/**
 * Estado del pedido — PANTALLA PENDIENTE.
 *
 * Puntos 12 a 19: el cliente sigue su pedido hasta recibirlo.
 *
 * Qué se puede reusar: PedidoService, que ya tiene los estados del enunciado.
 *
 * Está creada como armazón para que el acceso del inicio ya lleve a algún
 * lado: así se puede recorrer el circuito completo del cliente mientras cada
 * pantalla se completa por separado.
 */
@Component({
    selector: 'app-estado-pedido',
    templateUrl: './estado-pedido.page.html',
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class EstadoPedidoPage {}
