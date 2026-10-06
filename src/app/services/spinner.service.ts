import { Injectable, Signal, computed, effect, signal } from '@angular/core';

type IonicColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';

/**
 * Spinner con el logo, el de "todas las esperas" que pide el enunciado.
 *
 * Lleva una CUENTA de esperas en curso y no una bandera: una pantalla puede
 * estar esperando dos cosas a la vez (traer los pedidos y, a la vez, confirmar
 * uno). Con una bandera, el primero en terminar apagaba el spinner y la segunda
 * espera quedaba sin aviso. Con la cuenta, el spinner se apaga recién cuando
 * terminan todas.
 *
 * La cuenta nunca baja de cero: un `hide()` de más —por ejemplo, dos `finally`
 * para un solo `show()`— no deja el spinner trabado para siempre.
 */
@Injectable({
    providedIn: 'root',
})
export class SpinnerService {
    private esperas = signal(0);

    isLoading = computed(() => this.esperas() > 0);
    color = signal<IonicColor>('primary');

    show(config?: { color?: IonicColor }) {
        this.color.set(config?.color ?? 'primary');

        this.esperas.update((cuantas) => cuantas + 1);
    }

    hide() {
        this.esperas.update((cuantas) => Math.max(0, cuantas - 1));
    }

    /** Apaga el spinner pase lo que pase. Para cortar al cambiar de pantalla. */
    reset() {
        this.esperas.set(0);
    }

    /**
     * Engancha el spinner a la bandera de carga de un servicio.
     *
     * Varios servicios ya llevan su propio `cargando` para deshabilitar
     * botones. En lugar de que cada pantalla prenda y apague el spinner a mano
     * en cada consulta —y se olvide en alguna—, el spinner sigue esas banderas.
     *
     * Se llama una sola vez al arrancar la aplicación, desde un contexto de
     * inyección (el constructor de AppComponent).
     */
    seguir(fuente: Signal<boolean>): void {
        let mostrando = false;

        effect(() => {
            const ocupado = fuente();

            // Sin esta comparación, cualquier recálculo volvería a sumar una
            // espera y el spinner quedaría prendido para siempre.
            if (ocupado === mostrando) return;

            mostrando = ocupado;

            if (ocupado) this.show();
            else this.hide();
        });
    }
}
