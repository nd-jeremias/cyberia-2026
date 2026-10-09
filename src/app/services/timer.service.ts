import { Service, signal } from '@angular/core';

@Service()
export class TimerService {
    // Señales públicas que cualquier componente o servicio puede leer
    public segundos = signal<number>(0);
    public terminado = signal<boolean>(false);

    private timerId: any = null;

    /**
     * Inicia la cuenta regresiva de forma segura.
     * @param tiempoInicial Segundos totales para el juego
     */
    public iniciar(tiempoInicial: number) {
        this.detener(); // Limpieza preventiva
        this.segundos.set(tiempoInicial);
        this.terminado.set(false);

        this.timerId = setInterval(() => {
            const tiempoActual = this.segundos();

            if (tiempoActual > 1) {
                this.segundos.set(tiempoActual - 1);
            } else {
                // Llegó a cero 💥
                this.segundos.set(0);
                this.terminado.set(true);
                this.detener();
            }
        }, 1000);
    }

    /**
     * Detiene el cronómetro y limpia el intervalo de memoria.
     */
    public detener() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }
}
