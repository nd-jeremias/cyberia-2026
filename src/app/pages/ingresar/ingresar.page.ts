import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { LoginInterface } from '../../interfaces/auth.interface';
import { SpinnerService } from '../../services/spinner.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { HeaderLogoComponent } from '../../components/header-logo/header-logo.component';

@Component({
    selector: 'app-ingresar',
    templateUrl: './ingresar.page.html',
    styleUrls: ['./ingresar.page.scss'],
    imports: [IonContent, LoginFormComponent, HeaderLogoComponent],
})
export class IngresarPage {
    private router = inject(Router);
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);
    private authService = inject(AuthService);
    private notificaciones = inject(NotificacionesService);

    /** Punto 9: el invitado no se loguea acá, va a cargar su nombre y su foto. */
    irAIngresoAnonimo() {
        this.router.navigate(['/ingreso-anonimo']);
    }

    async handleLogin(credentials: LoginInterface) {
        this.spinner.show();

        try {
            await this.authService.login(credentials);

            // Recien ahora hay sesion, asi que el dispositivo puede asociarse
            // al usuario: se registra en Firebase y se guarda su `token_push`.
            await this.notificaciones.alIniciarSesion();

            this.router.navigate(['/inicio']);
        } catch (error: any) {
            // Registramos el error real en la consola para poder debuggear
            console.error('Error en el proceso de login:', error);

            // Extraemos el mensaje de texto del error
            // Si por alguna razón no es un objeto Error, usamos un mensaje genérico por seguridad
            const mensajeAmigable = error instanceof Error ? error.message : 'Ocurrió un error al ingresar. Revise los datos ingresados';

            // Mostramos el mensaje extraído en la interfaz
            this.modal.setOpen('Error al ingresar', mensajeAmigable);

            this.modal.setOpen('Error al ingresar', this.mensajeDeIngreso(error), 'error');
        } finally {
            this.spinner.hide();
        }
    }

    /**
     * Traduce el fallo del ingreso a algo que le sirva a quien está en la caja.
     *
     * Los estados que contempla el enunciado —registro pendiente (punto 5) y
     * registro rechazado (punto 7)— ya vienen explicados desde `AuthService`, y
     * son justamente los que hay que mostrar tal cual: un genérico "verifique
     * los datos" manda a revisar una contraseña que está bien. Sólo los errores
     * de credenciales y de red se traducen, porque los de Supabase vienen en
     * inglés.
     */
    private mensajeDeIngreso(error: unknown): string {
        const original = error instanceof Error ? error.message : '';

        if (/Invalid login credentials/i.test(original)) {
            return 'El correo o la contraseña no son correctos.';
        }

        if (/Email not confirmed/i.test(original)) {
            return 'La cuenta todavía no confirmó su correo electrónico.';
        }

        if (/fetch|network|Failed to/i.test(original)) {
            return 'No se pudo conectar con el servidor. Revise su conexión e intente de nuevo.';
        }

        return original || 'No se pudo iniciar sesión. Verifique los datos e intente nuevamente.';
    }
}
