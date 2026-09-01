import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { BotonAtrasComponent } from '../../components/boton-atras/boton-atras.component';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-gestion-mesas',
    templateUrl: './gestion-mesas.page.html',
    styleUrls: ['./gestion-mesas.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, BotonAtrasComponent, RouterLink],
})
export class GestionMesasPage implements OnInit {
    constructor() {}

    ngOnInit() {}
}
