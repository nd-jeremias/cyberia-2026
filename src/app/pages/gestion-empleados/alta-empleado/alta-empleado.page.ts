import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { FormularioRegistroComponent } from '../../../components/formulario-registro/formulario-registro.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../services/spinner.service';
import { ModalService } from '../../../services/modal.service';
import { AuthService } from '../../../services/auth.service';
import { EmailService } from '../../../services/email.service';

@Component({
    selector: 'app-alta-empleado',
    templateUrl: './alta-empleado.page.html',
    styleUrls: ['./alta-empleado.page.scss'],
    imports: [IonContent, CommonModule, FormsModule, FormularioRegistroComponent, HeaderComponent],
})
export class AltaEmpleadoPage implements OnInit {
    constructor() {}

    ngOnInit() {}

    private router = inject(Router);
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);
    private authService = inject(AuthService);
    private emailService = inject(EmailService);

    async handleRegistro(formData: FormData) {
        this.spinner.show();
        try {
            await this.authService.register(formData);
            
            const nombre = formData.get('nombre') as String
            const apellido = formData.get('apellido') as String
            this.spinner.hide();
            this.modal.setOpen('Registro', `Empleado agregado correctamente:\n ${nombre} ${apellido} dado de alta.`);
            this.router.navigate(['/gestion-empleados']);
        } catch (error: any) {
            this.spinner.hide();
            console.error('Error en el proceso de registro:', error);
            this.modal.setOpen('Error', error.message || 'No se pudo completar el registro');
        }
    }
}
