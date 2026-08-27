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

@Component({
    selector: 'app-registrarse',
    templateUrl: './registrarse.page.html',
    styleUrls: ['./registrarse.page.scss'],
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonBackButton,
        IonContent,
        FormularioRegistroComponent,
    ],
})
export class RegistrarsePage {
    private router = inject(Router);
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);

    async handleRegistro(formData: FormData) {
        console.log(formData)
        this.spinner.show();
        // Lógica para enviar formData a Supabase (Auth + Storage + Tabla usuarios)
        this.spinner.hide();
        this.modal.setOpen(true, 'Registro', 'Solicitud enviada correctamente');
        this.router.navigate(['/ingresar']);
    }
}
