import { Component, input, OnInit } from '@angular/core';
import { IonBackButton, IonButtons } from '@ionic/angular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { remixArrowGoBackFill } from '@ng-icons/remixicon';

@Component({
    selector: 'app-boton-atras',
    templateUrl: './boton-atras.component.html',
    styleUrls: ['./boton-atras.component.scss'],
    providers: [provideIcons({ remixArrowGoBackFill })],
    imports: [IonButtons, IonBackButton, NgIcon],
})
export class BotonAtrasComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
    rutaPorDefecto = input<string>('/inicio');
}
