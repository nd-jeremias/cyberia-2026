import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { FormularioUsuarioAnonimoComponent } from '../../components/formulario-usuario-anonimo/formulario-usuario-anonimo.component';
import { AnonimoAltaInterface } from '../../interfaces/cliente.interface';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { SpinnerService } from '../../services/spinner.service';
import { HeaderLogoComponent } from '../../components/header-logo/header-logo.component';

/**
 * Ingreso de cliente anónimo (punto 9 del enunciado).
 *
 * A diferencia del registro común, no hay aprobación: el cliente entra
 * directamente y ya puede escanear el QR de ingreso al local.
 */
@Component({
    selector: 'app-ingreso-anonimo',
    templateUrl: './ingreso-anonimo.page.html',
    styleUrls: ['./ingreso-anonimo.page.scss'],
    imports: [IonContent, FormularioUsuarioAnonimoComponent, HeaderLogoComponent],
})
export class IngresoAnonimoPage {
    private router = inject(Router);
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);
    private authService = inject(AuthService);
    private notificaciones = inject(NotificacionesService);

    async onIngresoAnonimo(cliente: AnonimoAltaInterface) {
        this.spinner.show();

        try {
            await this.authService.ingresarComoAnonimo(cliente);

            // Igual que el ingreso con credenciales: el invitado también recibe
            // avisos (mesa asignada, estado del pedido), así que su dispositivo
            // tiene que quedar asociado a la sesión recién abierta.
            await this.notificaciones.alIniciarSesion();

            this.modal.setOpen('Bienvenido', `${cliente.nombres}, ya podés escanear el código QR de ingreso.`);

            this.router.navigate(['/inicio']);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo ingresar como invitado.';

            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }
}
