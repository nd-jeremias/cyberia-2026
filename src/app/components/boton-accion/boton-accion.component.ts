import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-boton-accion',
    templateUrl: './boton-accion.component.html',
    styleUrls: ['./boton-accion.component.scss'],
    imports: [RouterLink, FaIconComponent],
})
export class BotonAccionComponent {
    ruta = input<string>('/inicio');
    textoBtn = input<string>('');
}
