import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { BotonAccionComponent } from '../../components/boton-accion/boton-accion.component';

/**
 *
 * Gestión de clientes para dueño y supervisor (puntos 6, 7 y 8).
 */
@Component({
    selector: 'app-gestion-clientes',
    templateUrl: './gestion-clientes.page.html',
    styleUrls: ['./gestion-clientes.page.scss'],
    imports: [IonContent, CommonModule, FormsModule, HeaderComponent, BotonAccionComponent],
})
export class GestionClientesPage {}
