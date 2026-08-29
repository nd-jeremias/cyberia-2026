import { Component, inject } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { FormularioAltaMesaComponent } from '../../components/formulario-alta-mesa/formulario-alta-mesa.component';
import { MesaAltaInterface } from '../../interfaces/mesa.interface';
import { ModalService } from '../../services/modal.service';
import { SpinnerService } from '../../services/spinner.service';

@Component({
    selector: 'app-alta-mesa',
    templateUrl: './alta-mesa.page.html',
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        FormularioAltaMesaComponent,
    ],
})
export class AltaMesaPage {
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);

    async onAltaMesa(mesa: MesaAltaInterface) {
        this.spinner.show();

        try {
            // TODO: persistir en Supabase y generar el QR de la mesa.
            await new Promise((resolve) => setTimeout(resolve, 400));

            this.modal.setOpen(
                'Mesa cargada',
                `La mesa N° ${mesa.numeroMesa} se registró correctamente.`
            );
        } finally {
            this.spinner.hide();
        }
    }
}
