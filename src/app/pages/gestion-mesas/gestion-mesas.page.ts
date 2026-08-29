import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
    selector: 'app-gestion-mesas',
    templateUrl: './gestion-mesas.page.html',
    styleUrls: ['./gestion-mesas.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class GestionMesasPage implements OnInit {
    constructor() {}

    ngOnInit() {}
}
