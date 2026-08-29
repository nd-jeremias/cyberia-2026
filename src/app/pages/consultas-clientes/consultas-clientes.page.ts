import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
    selector: 'app-consultas-clientes',
    templateUrl: './consultas-clientes.page.html',
    styleUrls: ['./consultas-clientes.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class ConsultasClientesPage implements OnInit {
    constructor() {}

    ngOnInit() {}
}
