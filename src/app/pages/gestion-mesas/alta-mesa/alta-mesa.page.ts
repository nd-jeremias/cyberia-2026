import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { FormularioAltaMesaComponent } from '../../../components/formulario-alta-mesa/formulario-alta-mesa.component';
import { BotonAtrasComponent } from '../../../components/boton-atras/boton-atras.component';

@Component({
    selector: 'app-alta-mesa',
    templateUrl: './alta-mesa.page.html',
    styleUrls: ['./alta-mesa.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FormularioAltaMesaComponent, BotonAtrasComponent],
})
export class AltaMesaPage implements OnInit {
    constructor() {}

    ngOnInit() {}
}
