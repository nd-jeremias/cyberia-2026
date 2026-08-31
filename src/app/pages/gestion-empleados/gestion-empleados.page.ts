import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

/**
 * Alta y administración de empleados (punto 1).
 *
 * Pantalla todavía sin implementar: por ahora sólo tiene el armazón
 * generado y la ruta declarada.
 */
@Component({
    selector: 'app-gestion-empleados',
    templateUrl: './gestion-empleados.page.html',
    styleUrls: ['./gestion-empleados.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class GestionEmpleadosPage {}
