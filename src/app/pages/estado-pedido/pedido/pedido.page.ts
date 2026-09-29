import { Component, effect, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
    selector: 'app-pedido',
    templateUrl: './pedido.page.html',
    styleUrls: ['./pedido.page.scss'],
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule],
})
export class PedidoPage implements OnInit {

    spinner = inject(SpinnerService)

    pedidoId = input<string>();

    constructor() {
        effect(() => {
            const id = this.pedidoId();
            if (id) this.cargarPedido(id);
        });
    }

    ngOnInit() {}

    private async cargarPedido(id: string) {
        // Aca hay que hacer una consulta y traer solamente el pedido seleccionado
    }
}
