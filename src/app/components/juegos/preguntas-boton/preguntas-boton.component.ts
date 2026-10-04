import { Component, input, OnInit } from '@angular/core';
import { Opcion } from '../../../interfaces/games.interface';

@Component({
    selector: 'app-preguntas-boton',
    templateUrl: './preguntas-boton.component.html',
    styleUrls: ['./preguntas-boton.component.scss'],
    imports: [],
})
export class PreguntasBotonComponent implements OnInit {
    opcion = input.required<Opcion>();
    seleccionado = input<boolean>(false);

    constructor() {}

    ngOnInit() {}

}
