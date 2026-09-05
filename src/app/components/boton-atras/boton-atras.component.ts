import { Component, input } from '@angular/core';
import { IonBackButton, IonButtons } from '@ionic/angular';

/**
 * Botón de volver de la barra superior.
 *
 * Se quitaron `NgIcon` y su `provideIcons`: el icono que registraban vivía
 * dentro de `ion-back-button`, que no renderiza contenido propio, así que nunca
 * llegaba a dibujarse. La flecha ahora es la del propio componente de Ionic,
 * con el aspecto que le da la hoja de estilos.
 */
@Component({
    selector: 'app-boton-atras',
    templateUrl: './boton-atras.component.html',
    styleUrls: ['./boton-atras.component.scss'],
    imports: [IonButtons, IonBackButton],
})
export class BotonAtrasComponent {
    rutaPorDefecto = input<string>('/inicio');
}
