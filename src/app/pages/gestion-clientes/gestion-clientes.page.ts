import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

/**
 * Gestión de clientes para dueño y supervisor (puntos 6, 7 y 8).
 *
 * Pantalla todavía sin implementar: por ahora sólo tiene el armazón
 * generado y la ruta declarada.
 */
@Component({
    selector: 'app-gestion-clientes',
    templateUrl: './gestion-clientes.page.html',
    styleUrls: ['./gestion-clientes.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class GestionClientesPage {}
