import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { LoginInterface } from '../../interfaces/auth.interface';
import { SpinnerService } from '../../services/spinner.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';

@Component({
    selector: 'app-ingresar',
    templateUrl: './ingresar.page.html',
    imports: [IonHeader, IonToolbar, IonTitle, IonContent, LoginFormComponent],
})
export class IngresarPage {
    private router = inject(Router);
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);
    private authService = inject(AuthService);
    private notificaciones = inject(NotificacionesService);

    async handleLogin(credentials: LoginInterface) {
        this.spinner.show();

        try {
            await this.authService.login(credentials);

            // Recien ahora hay sesion, asi que el token puede asociarse al usuario.
            await this.notificaciones.sincronizarToken();

            this.router.navigate(['/inicio']);
        } catch (error: any) {
            // 1. Mostramos el mensaje amigable en la interfaz

            this.modal.setOpen(
                'Error al ingresar',
                'No se pudo iniciar sesión. Verifique los datos e intente nuevamente.'
            );

            // 2. Registramos el error real en la consola para poder debuggear
            console.error('Error en el proceso de login:', error);

            // 3. Propagamos el error de forma correcta (Sintaxis válida)
            throw error;
        } finally {
            this.spinner.hide();
        }
    }
}
