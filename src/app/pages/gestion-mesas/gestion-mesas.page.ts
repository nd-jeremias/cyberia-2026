import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

/**
 * Administración de mesas del salón (punto 4).
 *
 * Pantalla todavía sin implementar: por ahora sólo tiene el armazón
 * generado y la ruta declarada.
 */
@Component({
    selector: 'app-gestion-mesas',
    templateUrl: './gestion-mesas.page.html',
    styleUrls: ['./gestion-mesas.page.scss'],
    imports: [IonContent, IonIcon, CommonModule, FormsModule, RouterLink, HeaderComponent],
})
export class GestionMesasPage {}
