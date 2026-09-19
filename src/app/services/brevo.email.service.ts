import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BrevoEmailService {
    private readonly http = inject(HttpClient);
    private readonly EDGE_FUNCTION_URL = 'https://uwmptccyleznngdazgrp.supabase.co/functions/v1/enviar-email';
    private readonly SUPABASE_ANON_KEY =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bXB0Y2N5bGV6bm5nZGF6Z3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NjE2MTAsImV4cCI6MjEwMTMzNzYxMH0.AEm0_DVgZaR9Y4lT-A2rVQTG-r0NBtp4HXNmTuFhThI';

    private readonly TEMPLATE_SOLICITUD = 1;
    private readonly TEMPLATE_RESPUESTA = 2;

    /**
     * Envía el email de Confirmación (Aprobado / Rechazado) con asunto dinámico.
     */
    async enviarEmailConfirmacion(correo: string, nombre: string, estado: boolean): Promise<void> {
        const body = {
            correo: correo,
            templateId: this.TEMPLATE_RESPUESTA,
            params: {
                nombre: nombre,
                titulo: estado ? '¡Registro aprobado!' : 'Solicitud de registro',
                asunto: estado
                    ? '¡Tu registro en Cyberia fue aprobado! 🎉'
                    : 'Actualización sobre tu solicitud de registro',
                estado: estado ? 'Aprobado' : 'Rechazado',
                colorEstado: estado ? '#2ec4b6' : '#c1272d',
                mensaje: estado
                    ? 'Tu solicitud de registro fue revisada y aprobada. Ya podés utilizar Cyberia.'
                    : 'Tu solicitud de registro fue revisada, pero no pudo ser aprobada en esta oportunidad.',
                mensajeFinal: estado
                    ? 'Ya podés ingresar a Cyberia desde la aplicación utilizando el correo y contraseña registrados.'
                    : 'Si considerás que se trata de un error, podés comunicarte con nuestro equipo para obtener más información.',
            },
        };

        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.SUPABASE_ANON_KEY}`,
        });

        try {
            await firstValueFrom(this.http.post<any>(this.EDGE_FUNCTION_URL, body, { headers }));
            console.log(`Email de ${estado ? 'Aprobado' : 'Rechazado'} enviado correctamente a ${correo}`);
        } catch (error) {
            console.error('Error al enviar el email de confirmación:', error);
            throw error;
        }
    }

    /**
     * Envía el aviso de Registro Pendiente con asunto dinámico.
     */
    async enviarAvisoRegistroPendiente(email: string, nombre: string): Promise<void> {
        const body = {
            correo: email,
            templateId: this.TEMPLATE_SOLICITUD,
            params: {
                nombre: nombre,
                asunto: 'Recibimos tu solicitud de registro ⏳',
            },
        };

        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.SUPABASE_ANON_KEY}`,
        });

        try {
            await firstValueFrom(this.http.post<any>(this.EDGE_FUNCTION_URL, body, { headers }));
            console.log(`Email de confirmación de solicitud enviado correctamente a ${email}`);
        } catch (error) {
            console.error('Error al enviar el email de registro pendiente:', error);
            throw error;
        }
    }
}
