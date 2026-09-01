import { Component, input, OnInit } from '@angular/core';
import { IonBackButton, IonButtons, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { triangleSharp } from 'ionicons/icons';

@Component({
    selector: 'app-boton-atras',
    templateUrl: './boton-atras.component.html',
    styleUrls: ['./boton-atras.component.scss'],
    imports: [IonButtons, IonBackButton, IonIcon],
})
export class BotonAtrasComponent implements OnInit {
    constructor() {
        addIcons({ triangleSharp });
    }

    ngOnInit() {}
    rutaPorDefecto = input<string>('/inicio'); 

}
