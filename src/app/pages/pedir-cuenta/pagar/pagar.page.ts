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

    boton: BotonHomeInterface = {
        texto: 'Pagar',
        icono: 'credit-card',
        ruta: '',
        accion: () => this.pagar(),
    };

    constructor() {}

    ngOnInit() {}

    async pagar() {
        this.spinner.show();

        try {
            // Aca deberia ser un mensaje mas personalizado, pero hay q traer la mesa, y para eso hay q traer el ID. Revisar el local storage primero
            await this.notificaciones.enviarAvisos(
                ['mozo'],
                'Pago realizado',
                `Un cliente ha realizado un pago. Confirma la recepción.`,
                'pago'
            );

            await new Promise((resolve) => setTimeout(resolve, 2500));

            this.router.navigate(['/inicio']);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo realizar el pago.';
            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }
}
