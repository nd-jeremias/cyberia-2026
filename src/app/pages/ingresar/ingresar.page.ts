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

            // Recien ahora hay sesion, asi que el token puede asociarse al usuario.
            await this.notificaciones.sincronizarToken();

            this.router.navigate(['/inicio']);
        } catch (error: any) {
            // Registramos el error real en la consola para poder debuggear
            console.error('Error en el proceso de login:', error);

            // Extraemos el mensaje de texto del error
            // Si por alguna razón no es un objeto Error, usamos un mensaje genérico por seguridad
            const mensajeAmigable = error instanceof Error ? error.message : 'Ocurrió un error al ingresar. Revise los datos ingresados';

            // Mostramos el mensaje extraído en la interfaz
            this.modal.setOpen('Error al ingresar', mensajeAmigable);

            // 3. Propagamos el error de forma correcta (Sintaxis válida)
            throw error;
        } finally {
            this.spinner.hide();
        }
    }
}
