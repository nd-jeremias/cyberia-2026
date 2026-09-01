import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { BotonAtrasComponent } from '../../components/boton-atras/boton-atras.component';
import { RouterLink } from '@angular/router';

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
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, BotonAtrasComponent, RouterLink],
})
export class GestionMesasPage {}
