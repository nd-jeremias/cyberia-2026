import { Service } from '@angular/core';
import { Haptics } from '@capacitor/haptics';

/**
 * Duración de cada vibración, en milisegundos.
 *
 * No se usa `Haptics.notification()`: su patrón de error dura unos 77 ms a
 * media intensidad (27 ms + 50 ms) y en muchos teléfonos directamente no se
 * percibe. El enunciado pide vibrar ante cada error, así que la vibración tiene
 * que notarse: un pulso continuo es inconfundible.
 */
const DURACION_ERROR = 400;
const DURACION_AVISO = 200;

/**
 * Vibración del dispositivo.
 *
 * La API de vibración no existe en todos los entornos: en un navegador de
 * escritorio y en los tests `Haptics` lanza una excepción. Si esa excepción
 * escapara, cortaría el flujo antes de mostrar el aviso de error, así que acá
 * se absorbe: la vibración refuerza el aviso, nunca lo condiciona.
 */
@Service()
export class VibracionService {
    /** Vibración de error. Nunca lanza. */
    async error(): Promise<void> {
        await this.vibrar(DURACION_ERROR);
    }

    /** Vibración corta para avisos que no son errores. Nunca lanza. */
    async exito(): Promise<void> {
        await this.vibrar(DURACION_AVISO);
    }

    private async vibrar(duracion: number): Promise<void> {
        try {
            await Haptics.vibrate({ duration: duracion });
        } catch {
            // Entorno sin vibración: no es un error de la aplicación.
        }
    }
}
