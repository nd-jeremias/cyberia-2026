import { Component, inject, signal } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';
import { BotonHomeComponent } from '../../components/boton-home/boton-home.component';
import { BotonHomeInterface } from '../../interfaces/component.interface';

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
    styleUrls: ['./juegos.page.scss'],
    imports: [IonContent, BotonHomeComponent, HeaderComponent],
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

    botonMemoria: BotonHomeInterface = {
        texto: 'Adivina el par',
        icono: 'brain',
        ruta: '/juegos/memoria',
    };

    botonQuiz: BotonHomeInterface = {
        texto: 'Preguntas Rapidas',
        icono: 'question',
        ruta: '/juegos/preguntas',
    };

    boton: BotonHomeInterface = {
        texto: '',
        icono: '',
        ruta: '',
    };
}
