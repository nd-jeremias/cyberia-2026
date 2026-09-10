import { Component, computed, input, OnInit } from '@angular/core';
import { MesaInterface } from '../../interfaces/mesa.interface';
import { IonIcon, IonButton } from '@ionic/angular';

@Component({
    selector: 'app-tarjeta-mesa',
    templateUrl: './tarjeta-mesa.component.html',
    styleUrls: ['./tarjeta-mesa.component.scss'],
    imports: [IonButton, IonIcon],
})
export class TarjetaMesaComponent implements OnInit {
    mesa = input.required<MesaInterface>();

    constructor() {}

    ngOnInit() {}

    onEditar() {}

    onEliminar() {}
}
