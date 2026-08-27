import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
} from '@ionic/angular';
import { SpinnerService } from '../../services/spinner.service';
import { ModalService } from '../../services/modal.service';
import { FormularioRegistroComponent } from '../../components/formulario-registro/formulario-registro.component';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-registrarse',
    templateUrl: './registrarse.page.html',
    styleUrls: ['./registrarse.page.scss'],
    imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, FormularioRegistroComponent],
})
export class RegistrarsePage {
    private router = inject(Router);
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);
    authService = inject(AuthService);

    async handleRegistro(formData: FormData) {
        this.spinner.show();
        try {
            this.authService.register(formData);
            this.spinner.hide();
            this.modal.setOpen(true, 'Registro', 'Solicitud enviada correctamente');
            this.router.navigate(['/ingresar']);
        } catch (error: any) {
            this.spinner.hide();
            console.error('Error en el proceso de registro:', error);
            this.modal.setOpen(true, 'Error', error.message || 'No se pudo completar el registro');
        }
    }
}

