import { Service, signal, WritableSignal } from '@angular/core';

export type ListadoJuegos = 'memoria' | 'preguntas';

@Service()
export class JuegosService {
    public gameState = signal<'RULES' | 'PLAYING' | 'RESULT'>('RULES');

    // 1. Declaramos el mapa de signals directamente como propiedad de la clase
    // Usamos WritableSignal<boolean> para poder mutar sus valores en el futuro si lo necesitas
    public juegosEstado: Record<ListadoJuegos, WritableSignal<boolean>> = {
        memoria: signal<boolean>(false),
        preguntas: signal<boolean>(false),
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
}
