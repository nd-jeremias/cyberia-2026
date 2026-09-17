import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';

/**
 * Envío automático de correos al cliente.
 *
 * El enunciado (puntos 5, 7 y 8) exige avisar por correo cada cambio de estado
 * del registro, y que el envío sea automático desde una cuenta de la empresa,
 * nunca desde la cuenta personal de un integrante.
 *
 * Se usa EmailJS para no montar un servidor de correo propio. Los
 * identificadores de la cuenta viven en `environment.ts`.
 *
 * Ningún método lanza: el correo es un aviso, no el trámite. Si EmailJS está
 * caído, el cliente igual tiene que quedar aprobado o rechazado en la base. Los
 * métodos devuelven si el correo salió, para que la pantalla pueda decir la
 * verdad en vez de prometer un correo que nunca se envió.
 */
@Injectable({
    providedIn: 'root',
})
export class EmailService {
    private config = environment.emailjs;

    constructor() {
        emailjs.init(this.config.publicKey);
    }

    /**
     * Punto 5: avisa que el registro quedó a la espera de aprobación.
     *
     * Se envía apenas el cliente termina el formulario, para que sepa que su
     * solicitud entró y que todavía no puede ingresar.
     */
    async enviarAvisoRegistroPendiente(email: string, nombre: string): Promise<boolean> {
        return this.enviar(
            this.config.plantillaPendiente,
            email,
            nombre,
            'Gracias por registrarte. Tu cuenta está pendiente de aprobación por el dueño o supervisor.'
        );
    }

    /**
     * Puntos 7 y 8: informa la resolución de la solicitud.
     *
     * El enunciado pide que los correos de aprobación y rechazo se distingan
     * entre sí, no sólo del correo por defecto: por eso cada uno usa su propia
     * plantilla.
     */
    async enviarResolucionCuenta(email: string, nombre: string, aprobado: boolean): Promise<boolean> {
        const mensaje = aprobado
            ? '¡Tu cuenta ha sido aprobada con éxito! Ya podés ingresar a la aplicación.'
            : 'Lamentamos informarte que tu solicitud de registro no fue aprobada.';

        const plantilla = aprobado ? this.config.plantillaAprobado : this.config.plantillaRechazado;

        return this.enviar(plantilla, email, nombre, mensaje);
    }

    /**
     * Única salida hacia EmailJS.
     *
     * Descarta de entrada los destinatarios vacíos: el cliente anónimo no tiene
     * correo (`correo_electronico` es NULL en la base), y sin esta guarda la
     * llamada saldría igual para terminar fallando del otro lado.
     */
    private async enviar(plantilla: string, email: string, nombre: string, mensaje: string): Promise<boolean> {
        if (!email?.trim()) {
            console.warn('No se envía el correo: el destinatario no tiene dirección cargada.');

            return false;
        }

        try {
            await emailjs.send(this.config.serviceId, plantilla, {
                email: email.trim(),
                to_name: nombre,
                message: mensaje,
            });

            return true;
        } catch (error) {
            console.error('No se pudo enviar el correo automático:', error);

            return false;
        }
    }
}
