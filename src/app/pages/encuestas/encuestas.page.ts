import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

/**
 * Encuestas — PANTALLA PENDIENTE.
 *
 * Puntos 9 y 20: cargar la encuesta de la visita y ver los resultados en gráficos.
 *
 * Qué se puede reusar: Nada todavía: falta la tabla y una librería de gráficos.
 *
 * Está creada como armazón para que el acceso del inicio ya lleve a algún
 * lado: así se puede recorrer el circuito completo del cliente mientras cada
 * pantalla se completa por separado.
 */
@Component({
    selector: 'app-encuestas',
    templateUrl: './encuestas.page.html',
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class EncuestasPage {}
