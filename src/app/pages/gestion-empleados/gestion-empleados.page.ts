import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-gestion-empleados',
    templateUrl: './gestion-empleados.page.html',
    styleUrls: ['./gestion-empleados.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink],
})
export class GestionEmpleadosPage implements OnInit {
    constructor() {}

    ngOnInit() {}
}
