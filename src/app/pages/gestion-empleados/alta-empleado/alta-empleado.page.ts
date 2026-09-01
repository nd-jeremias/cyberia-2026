import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { FormularioRegistroComponent } from '../../../components/formulario-registro/formulario-registro.component';
import { BotonAtrasComponent } from '../../../components/boton-atras/boton-atras.component';

@Component({
    selector: 'app-alta-empleado',
    templateUrl: './alta-empleado.page.html',
    styleUrls: ['./alta-empleado.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, FormularioRegistroComponent, BotonAtrasComponent],
})
export class AltaEmpleadoPage implements OnInit {
    constructor() {}

    ngOnInit() {}
}
