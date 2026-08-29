import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
    selector: 'app-asignar-mesas',
    templateUrl: './asignar-mesas.page.html',
    styleUrls: ['./asignar-mesas.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class AsignarMesasPage implements OnInit {
    constructor() {}

    ngOnInit() {}
}
