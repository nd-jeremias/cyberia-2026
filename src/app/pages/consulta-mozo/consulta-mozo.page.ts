import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

/**
 * Consulta al mozo — PANTALLA PENDIENTE.
 *
 * Punto 11: sala de conversación entre mozos y clientes.
 *
 * Qué se puede reusar: La pantalla del mozo ya existe en /consultas-clientes.
 *
 * Está creada como armazón para que el acceso del inicio ya lleve a algún
 * lado: así se puede recorrer el circuito completo del cliente mientras cada
 * pantalla se completa por separado.
 */
@Component({
    selector: 'app-consulta-mozo',
    templateUrl: './consulta-mozo.page.html',
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class ConsultaMozoPage {}
