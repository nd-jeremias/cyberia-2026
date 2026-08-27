import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { FormularioUsuarioAnonimoComponent } from '../../components/formulario-usuario-anonimo/formulario-usuario-anonimo.component';
import { AnonimoAltaInterface } from '../../interfaces/cliente.interface';
import { ModalService } from '../../services/modal.service';
import { SpinnerService } from '../../services/spinner.service';

@Component({
    selector: 'app-ingreso-anonimo',
    templateUrl: './ingreso-anonimo.page.html',
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        FormularioUsuarioAnonimoComponent,
    ],
})
export class IngresoAnonimoPage {
    private router = inject(Router);
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);

    async onIngresoAnonimo(cliente: AnonimoAltaInterface) {
        this.spinner.show();

        try {
            // TODO: insertar en clientes_anonimos y subir la foto al bucket.
            await new Promise((resolve) => setTimeout(resolve, 400));

            this.modal.setOpen(
                true,
                'Bienvenido',
                `${cliente.nombres}, ya podés escanear el código QR de ingreso.`
            );

            this.router.navigate(['/home']);
        } finally {
            this.spinner.hide();
        }
    }
}
