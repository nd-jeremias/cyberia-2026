import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

/**
 * Consultas del cliente al mozo (punto 11): sala de conversación entre ambos.
 *
 * Pantalla todavía sin implementar: por ahora sólo tiene el armazón
 * generado y la ruta declarada.
 */
@Component({
    selector: 'app-consultas-clientes',
    templateUrl: './consultas-clientes.page.html',
    styleUrls: ['./consultas-clientes.page.scss'],
    imports: [IonContent, IonIcon, CommonModule, FormsModule, HeaderComponent],
})
export class ConsultasClientesPage {}
