import { Component, inject, input, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { BotonHomeInterface } from '../../interfaces/component.interface';
import { Router } from '@angular/router';

@Component({
    selector: 'app-boton-home',
    templateUrl: './boton-home.component.html',
    styleUrls: ['./boton-home.component.scss'],
    imports: [FaIconComponent],
})
export class BotonHomeComponent implements OnInit {
    router = inject(Router);

    boton = input.required<BotonHomeInterface>();

    constructor() {}

    ngOnInit() {}

    ejecutarAccion() {
        const datosBoton = this.boton();

        // 1. Si viene una función, la ejecuta
        if (datosBoton.accion) {
            datosBoton.accion();
        }
        // 2. Si viene una ruta, navega a ella
        if (datosBoton.ruta) {
            this.router.navigate([datosBoton.ruta]);
        }
    }
}
