import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

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
    imports: [IonContent, IonIcon, CommonModule, FormsModule, RouterLink, HeaderComponent],
})
export class GestionEmpleadosPage {}
