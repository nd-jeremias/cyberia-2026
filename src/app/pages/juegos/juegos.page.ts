import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

/**
 * Juegos — PANTALLA PENDIENTE.
 *
 * Puntos 14 y 15: tres juegos con descuento del 10, 15 y 20 por ciento.
 *
 * Qué se puede reusar: Nada todavía. El descuento se guarda en pedidos.descuento_juego.
 *
 * Está creada como armazón para que el acceso del inicio ya lleve a algún
 * lado: así se puede recorrer el circuito completo del cliente mientras cada
 * pantalla se completa por separado.
 */
@Component({
    selector: 'app-juegos',
    templateUrl: './juegos.page.html',
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class JuegosPage {}
