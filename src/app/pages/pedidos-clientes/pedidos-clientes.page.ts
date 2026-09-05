import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';

/**
 * Armado y seguimiento del pedido desde el lado del cliente (punto 12).
 *
 * Pantalla todavía sin implementar: por ahora sólo tiene el armazón
 * generado y la ruta declarada.
 */
@Component({
    selector: 'app-pedidos-clientes',
    templateUrl: './pedidos-clientes.page.html',
    styleUrls: ['./pedidos-clientes.page.scss'],
    imports: [IonContent, IonIcon, CommonModule, FormsModule, HeaderComponent],
})
export class PedidosClientesPage {}
