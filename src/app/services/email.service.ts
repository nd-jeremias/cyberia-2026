import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

/**
 * Envío automático de correos al cliente.
 *
 * El enunciado (puntos 5, 7 y 8) exige avisar por correo cada cambio de estado
 * del registro, y que el envío sea automático desde una cuenta de la empresa,
 * nunca desde la cuenta personal de un integrante.
 *
 * Se usa EmailJS para no montar un servidor de correo propio.
 */
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  // Identificadores de la cuenta de EmailJS. La clave pública está pensada
  // para usarse desde el navegador, pero conviene moverla a environment.ts
  // para no tener que tocar el código al cambiar de cuenta.
  private serviceId = 'service_ek7jpdd';
  private templateId = 'template_8fl84ys';
  private publicKey = 'RLbRJhW8Gk9IN-Z3Z';

  constructor() {
    emailjs.init(this.publicKey);
  }

  /**
   * Punto 5: avisa que el registro quedó a la espera de aprobación.
   *
   * Se envía apenas el cliente termina el formulario, para que sepa que su
   * solicitud entró y que todavía no puede ingresar.
   */
  async enviarAvisoRegistroPendiente(email: string, nombre: string) {
    return emailjs.send(this.serviceId, this.templateId, {
      email: email,
      to_name: nombre,
      message: 'Gracias por registrarte. Tu cuenta está pendiente de aprobación por el supervisor/dueño.',
    });
  }

  /**
   * Puntos 7 y 8: informa la resolución de la solicitud.
   *
   * El enunciado pide que los correos de aprobación y rechazo se distingan
   * entre sí, no sólo del correo por defecto.
   */
  async enviarResolucionCuenta(email: string, nombre: string, aprobado: boolean) {
    const mensaje = aprobado
      ? '¡Tu cuenta ha sido aprobada con éxito! Ya podés ingresar a la aplicación.'
      : 'Lamentamos informarte que tu solicitud de registro no fue aprobada.';

    const templateId = aprobado
    ? 'template_8fl84ys'
    : 'template_t44g5mr'
    return emailjs.send(this.serviceId, templateId, {
      email: email,
      to_name: nombre,
      message: mensaje,
    });
  }
}