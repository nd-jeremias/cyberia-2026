import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

/**
 * Administración de la carta: platos, bebidas y postres (puntos 2 y 3).
 *
 * Pantalla todavía sin implementar: por ahora sólo tiene el armazón
 * generado y la ruta declarada.
 */
@Component({
    selector: 'app-gestion-productos',
    templateUrl: './gestion-productos.page.html',
    styleUrls: ['./gestion-productos.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class GestionProductosPage {}
