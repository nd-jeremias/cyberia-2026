import { inject, Service, signal, WritableSignal } from '@angular/core';
import { AuthService } from './auth.service';
import { PedidoService } from './pedido.service';
import { ModalService } from './modal.service';
import { SpinnerService } from './spinner.service';

export type ListadoJuegos = 'memoria' | 'preguntas' | 'mayormenor';

@Service()
export class JuegosService {
    auth = inject(AuthService);
    pedidos = inject(PedidoService);
    modal = inject(ModalService);
    spinner = inject(SpinnerService);

    public gameState = signal<'RULES' | 'PLAYING' | 'RESULT'>('RULES');

    // 1. Declaramos el mapa de signals directamente como propiedad de la clase
    // Usamos WritableSignal<boolean> para poder mutar sus valores en el futuro si lo necesitas
    public juegosEstado: Record<ListadoJuegos, WritableSignal<boolean>> = {
        memoria: signal<boolean>(false),
        preguntas: signal<boolean>(false),
        mayormenor: signal<boolean>(false)
    };

    // Mantienes tus signals globales de control
    public Jugado = signal<boolean>(false);
    private descuentoAplicado = signal<boolean>(false);

    validarDescuento(juego: ListadoJuegos): number {
        // 2. Accedemos directamente a la propiedad de la clase
        const signalJuego = this.juegosEstado[juego];

        // 3. Evaluamos de manera ultra eficiente sin recrear objetos en memoria
        if (signalJuego && !signalJuego()) {
            if (!this.descuentoAplicado()) {
                this.descuentoAplicado.set(true);
                return 10;
            }
            return 5;
        }

        return 0;
    }

    // Método extra por si necesitas marcar el juego como completado tras recibir el descuento
    marcarComoJugado(juego: ListadoJuegos) {
        if (this.juegosEstado[juego]) {
            this.juegosEstado[juego].set(true);
            this.Jugado.set(true); // Actualiza también tu estado global si aplica
        }
    }

    exitGame(juego: ListadoJuegos) {
        this.marcarComoJugado(juego);
        this.gameState.set('RULES');
    }

    async finalizarPorVictoria(juego: ListadoJuegos) {
        this.spinner.show();
        try {
            const user_id = this.auth.session()?.user.id;
            if (!user_id) return;

            const pedido = await this.pedidos.pedidoActualDelCliente(user_id);
            if (!pedido) return;

            const descuento = this.validarDescuento('preguntas');
            // Actualiza el valor del descuento. Si ya existe un descuento previo, le suma el nuevo valor.
            const data = await this.pedidos.incrementarValor('pedidos', 'descuento_juego', pedido.id, descuento);

            // Aquí dispara la victoria
            console.log('🏆 ¡Ganaste!');
            const mensaje =
                descuento > 0
                    ? '¡Felicidades! Completaste el juego y obtuviste un descuento. Completa los otros para acumular descuentos adicionales.'
                    : '¡Felicidades! Completaste el juego satisfactoriamente.';

            this.modal.setOpen('¡Felicidades!', mensaje, 'info');
            this.exitGame(juego);
        } catch (error) {
            console.log(error);
            this.modal.setOpen('Error', 'Lo sentimos. Hubo un error al finalizar el juego.', 'error');
        } finally {
            this.spinner.hide();
        }
    }
}
