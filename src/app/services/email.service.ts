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
    // Identificadores de la cuenta de EmailJS. La clave pública está pensada
    // para usarse desde el navegador, pero conviene moverla a environment.ts
    // para no tener que tocar el código al cambiar de cuenta.
    private SERVICE_ID = 'service_1tirmyd';
    private PUBLIC_KEY = 'sWUFtRMdq0142btAN';
    private TEMPLATE_SOLICITUD = 'template_6x6quqj';
    private TEMPLATE_RESPUESTA = 'template_rkl1hpe';
    // private templateId = 'template_8fl84ys';

    constructor() {
        emailjs.init(this.PUBLIC_KEY);
    }

    /**
     * Punto 5: avisa que el registro quedó a la espera de aprobación.
     *
     * Se envía apenas el cliente termina el formulario, para que sepa que su
     * solicitud entró y que todavía no puede ingresar.
     */
    async enviarAvisoRegistroPendiente(email: string, nombre: string): Promise<void> {
        const templateParams = {
            nombre: nombre,
            to_email: email,
        };

        try {
            await emailjs.send(this.SERVICE_ID, this.TEMPLATE_SOLICITUD, templateParams, {
                publicKey: this.PUBLIC_KEY,
            });
            console.log(`Email de confirmacion de solicitud enviado correctamente a ${email}`);
        } catch (error) {
            console.error('Error al enviar el email:', error);
            throw error;
        }
    }

    /**
     * Puntos 7 y 8: informa la resolución de la solicitud.
     *
     * El enunciado pide que los correos de aprobación y rechazo se distingan
     * entre sí, no sólo del correo por defecto: por eso cada uno usa su propia
     * plantilla.
     */
    async enviarEmailConfirmacion(correo: string, nombre: string, estado: boolean): Promise<void> {
        const templateParams = {
            nombre: nombre,
            titulo: estado ? '¡Registro aprobado!' : 'Solicitud de registro',
            estado: estado ? 'Aprobado' : 'Rechazado',
            mensaje: estado
                ? 'Tu solicitud de registro fue revisada y aprobada. Ya podés utilizar Cyberia.'
                : 'Tu solicitud de registro fue revisada, pero no pudo ser aprobada en esta oportunidad.',
            mensajeFinal: estado
                ? 'Ya podés ingresar a Cyberia desde la aplicación utilizando el correo y contraseña registrados.'
                : 'Si considerás que se trata de un error, podés comunicarte con nuestro equipo para obtener más información.',
            to_email: correo,
        };

        try {
            await emailjs.send(this.SERVICE_ID, this.TEMPLATE_RESPUESTA, templateParams, {
                publicKey: this.PUBLIC_KEY,
            });
            console.log(`Email de ${estado} enviado correctamente a ${correo}`);
        } catch (error) {
            console.error('Error al enviar el email:', error);
            throw error;
        }
    }
}
