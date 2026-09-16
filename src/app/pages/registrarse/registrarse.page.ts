import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { SpinnerService } from '../../services/spinner.service';
import { ModalService } from '../../services/modal.service';
import { FormularioRegistroComponent } from '../../components/formulario-registro/formulario-registro.component';
import { AuthService } from '../../services/auth.service';
import { EmailService } from '../../services/email.service';
import { HeaderLogoComponent } from '../../components/header-logo/header-logo.component';
import { NotificacionesService } from '../../services/notificaciones.service';

@Component({
    selector: 'app-registrarse',
    templateUrl: './registrarse.page.html',
    styleUrls: ['./registrarse.page.scss'],
    imports: [IonContent, HeaderLogoComponent, FormularioRegistroComponent],
})
export class RegistrarsePage {
    private router = inject(Router);
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);
    authService = inject(AuthService);
    emailService = inject(EmailService);
    notificaciones = inject(NotificacionesService);

    async handleRegistro(formData: FormData) {
        this.spinner.show();
        // formData.forEach((value, key) => console.log(`${key}: ${value}`));
        try {
            await this.authService.register(formData);

            // 2. Extraer datos del FormData para el envío de correo
            const correo = formData.get('correo') as string;
            const nombres = formData.get('nombres') as string;

            // 3. Disparar el aviso automático de registro pendiente
            if (correo && nombres) {
                await this.emailService.enviarAvisoRegistroPendiente(correo, nombres);
                await this.notificaciones.enviarAvisos(
                    ['dueño', 'supervisor'],
                    'Nuevo usuario registrado',
                    'Hay un usuario nuevo a la espera de admisión.',
                    'cliente-pendiente'
                );
            }

            this.spinner.hide();
            this.modal.setOpen('Registro', 'Solicitud enviada correctamente');
            this.router.navigate(['/ingresar']);
        } catch (error: any) {
            this.spinner.hide();
            console.error('Error en el proceso de registro:', error);
            this.modal.setOpen('Error', error.message || 'No se pudo completar el registro');
        }
    }
}
