import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { FormularioUsuarioAnonimoComponent } from '../../components/formulario-usuario-anonimo/formulario-usuario-anonimo.component';
import { AnonimoAltaInterface } from '../../interfaces/cliente.interface';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { SpinnerService } from '../../services/spinner.service';

/**
 * Ingreso de cliente anónimo (punto 9 del enunciado).
 *
 * A diferencia del registro común, no hay aprobación: el cliente entra
 * directamente y ya puede escanear el QR de ingreso al local.
 */
@Component({
    selector: 'app-ingreso-anonimo',
    templateUrl: './ingreso-anonimo.page.html',
    imports: [
        IonContent,
        FormularioUsuarioAnonimoComponent,
    ],
})
export class IngresoAnonimoPage {
    private router = inject(Router);
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);
    private authService = inject(AuthService);

    async onIngresoAnonimo(cliente: AnonimoAltaInterface) {
        this.spinner.show();

        try {
            await this.authService.ingresarComoAnonimo(cliente);

            this.modal.setOpen(
                'Bienvenido',
                `${cliente.nombres}, ya podés escanear el código QR de ingreso.`
            );

            this.router.navigate(['/inicio']);
        } catch (error) {
            const mensaje =
                error instanceof Error
                    ? error.message
                    : 'No se pudo ingresar como invitado.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }
}
