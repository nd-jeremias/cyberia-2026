import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

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
    imports: [IonContent, IonIcon, CommonModule, FormsModule, HeaderComponent],
})
export class GestionClientesPage {}
