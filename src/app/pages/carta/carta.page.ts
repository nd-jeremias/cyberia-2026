import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

/**
 * Carta — PANTALLA PENDIENTE.
 *
 * Puntos 11 y 12: listado de productos con sus tres fotos, y armado del pedido.
 *
 * Qué se puede reusar: TarjetaListadoProductoComponent con modo="pedido", ProductosService y ChartService (el carrito, ya persiste en Preferences).
 *
 * Está creada como armazón para que el acceso del inicio ya lleve a algún
 * lado: así se puede recorrer el circuito completo del cliente mientras cada
 * pantalla se completa por separado.
 */
@Component({
    selector: 'app-carta',
    templateUrl: './carta.page.html',
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class CartaPage {}
