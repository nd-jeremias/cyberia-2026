import { map } from 'rxjs/operators';
import { Component, inject, signal } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';

/**
 * Juegos — PANTALLA PENDIENTE.
 *
 * Puntos 14 y 15: tres juegos con descuento del 10, 15 y 20 por ciento.
 *
 * Qué se puede reusar: Nada todavía. El descuento se guarda en pedidos.descuento_juego.
 *
 * Está creada como armazón para que el acceso del inicio ya lleve a algún
 * lado: así se puede recorrer el circuito completo del cliente mientras cada
 * pantalla se completa por separado.
 */
@Component({
    selector: 'app-juegos',
    templateUrl: './juegos.page.html',
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class JuegosPage {
    auth = inject(AuthService);
    pedidos = inject(PedidoService);

    verJuegos = signal<boolean>(false);

    async ngOnInit() {
        const userId = this.auth.session()?.user.id;
        if (!userId) return;

        const pedidosActivos = await this.pedidos.pedidoActualDelCliente(userId);

        if (pedidosActivos?.estado == 'Confirmado') {
            this.verJuegos.set(true);
        }
    }
}
