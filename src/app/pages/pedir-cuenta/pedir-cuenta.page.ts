import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

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
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class PedirCuentaPage {}
