import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
    selector: 'app-gestion-clientes',
    templateUrl: './gestion-clientes.page.html',
    styleUrls: ['./gestion-clientes.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class GestionClientesPage implements OnInit {
    constructor() {}

    ngOnInit() {}
}
