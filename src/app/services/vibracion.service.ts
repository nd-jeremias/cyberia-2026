import { Service } from '@angular/core';
import { Haptics, NotificationType } from '@capacitor/haptics';

/**
 * Vibración del dispositivo.
 *
 * El enunciado pide vibrar ante cualquier error, pero la API de vibración no
 * existe en todos los entornos: en un navegador de escritorio y bajo jsdom,
 * `Haptics` lanza una excepción.
 *
 * Ese detalle causó un error real: como la llamada se hacía antes de mostrar
 * el modal, la excepción cortaba el flujo y el usuario no veía ningún aviso.
 * Por eso acá los fallos se absorben: la vibración es un refuerzo de la
 * notificación, nunca un requisito para que la notificación ocurra.
 */
@Service()
export class VibracionService {
    /** Vibra indicando un error. Nunca lanza. */
    async error(): Promise<void> {
        await this.vibrar(NotificationType.Error);
    }

    /** Vibra indicando una operación exitosa. Nunca lanza. */
    async exito(): Promise<void> {
        await this.vibrar(NotificationType.Success);
    }

    private async vibrar(tipo: NotificationType): Promise<void> {
        try {
            await Haptics.notification({ type: tipo });
        } catch {
            // Entorno sin soporte de vibración: no es un error de la aplicación.
        }
    }
}
