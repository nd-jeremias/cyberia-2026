import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private serviceId = 'service_e6xpg2s';
  private templateId = 'template_vwi1j3c';
  private publicKey = 'CYS0VPBDEotYw_zMW';

  constructor() {
    emailjs.init(this.publicKey);
  }

  // 1. Cuando el cliente termina de llenar el form de registro
  async enviarAvisoRegistroPendiente(email: string, nombre: string) {
    return emailjs.send(this.serviceId, this.templateId, {
      to_email: email,
      to_name: nombre,
      message: 'Gracias por registrarte. Tu cuenta está pendiente de aprobación por el supervisor/dueño.',
    });
  }

  // 2. Cuando el dueño/supervisor lo aprueba o rechaza desde la app
  async enviarResolucionCuenta(email: string, nombre: string, aprobado: boolean) {
    const mensaje = aprobado
      ? '¡Tu cuenta ha sido aprobada con éxito! Ya podés ingresar a la aplicación.'
      : 'Lamentamos informarte que tu solicitud de registro no fue aprobada.';

    return emailjs.send(this.serviceId, this.templateId, {
      to_email: email,
      to_name: nombre,
      message: mensaje,
    });
  }
}