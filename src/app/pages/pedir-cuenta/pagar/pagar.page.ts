import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../../components/header/header.component';
import { BotonHomeComponent } from '../../../components/boton-home/boton-home.component';
import { BotonHomeInterface } from '../../../interfaces/component.interface';
import { SpinnerService } from '../../../services/spinner.service';
import { Router } from '@angular/router';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { ModalService } from '../../../services/modal.service';
import { AuthService } from '../../../services/auth.service';
import { SalonService } from '../../../services/salon.service';

@Component({
    selector: 'app-pagar',
    templateUrl: './pagar.page.html',
    styleUrls: ['./pagar.page.scss'],
    imports: [IonContent, CommonModule, FormsModule, HeaderComponent, BotonHomeComponent],
})
export class PagarPage implements OnInit {
    spinner = inject(SpinnerService);
    router = inject(Router);
    notificaciones = inject(NotificacionesService);
    modal = inject(ModalService);
    authService = inject(AuthService);
    salonService = inject(SalonService);

    boton: BotonHomeInterface = {
        texto: 'Pagar',
        icono: 'credit-card',
        ruta: '',
        accion: () => this.pagar(),
    };

    constructor() {}

    ngOnInit() {}

    async pagar() {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) {
            this.modal.setOpen('Sesión no encontrada', 'Volvé a iniciar sesión para continuar.');
            return;
        }

        this.spinner.show();

        try {
            // El pago es simulado: la espera representa el cobro con la tarjeta.
            await new Promise((resolve) => setTimeout(resolve, 2500));

            // Punto 21: el cliente queda "pagando" hasta que el mozo confirme.
            // Sin este paso el mozo no ve el cobro en "Pagos por confirmar" y
            // el punto 22 no se puede completar nunca.
            const pagado = await this.salonService.pagarCuenta(usuarioId);

            if (!pagado) {
                this.modal.setOpen(
                    'Pago no registrado',
                    'Ya pagaste o no estás sentado a una mesa. Si ya pagaste, esperá la confirmación del mozo.',
                    'error'
                );
                return;
            }

            await this.avisarAlMozo();

            this.router.navigate(['/inicio']);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo realizar el pago.';
            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }

    /**
     * Si el aviso falla, el pago ya quedó registrado y el mozo lo ve igual en
     * su pantalla: no se le muestra al cliente un error que parezca un cobro
     * rechazado.
     */
    private async avisarAlMozo(): Promise<void> {
        try {
            // Aca deberia ser un mensaje mas personalizado, pero hay q traer la mesa, y para eso hay q traer el ID. Revisar el local storage primero
            await this.notificaciones.enviarAvisos(
                ['mozo'],
                'Pago realizado',
                `Un cliente ha realizado un pago. Confirma la recepción.`,
                'pago'
            );
            this.modal.setOpen('Pago realizado', 'Se envió una notificacion al mozo. Espera que confirme tu pago.', 'info');
        } catch (error) {
            console.error('No se pudo avisar el pago al mozo:', error);
            this.modal.setOpen('Error', 'No se pudo avisar del pago al mozo', 'error');
        }
    }
}
