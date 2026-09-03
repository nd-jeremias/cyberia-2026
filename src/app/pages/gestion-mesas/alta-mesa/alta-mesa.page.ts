import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { FormularioAltaMesaComponent } from '../../../components/formulario-alta-mesa/formulario-alta-mesa.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { MesaAltaInterface } from '../../../interfaces/mesa.interface';
import { SpinnerService } from '../../../services/spinner.service';
import { ModalService } from '../../../services/modal.service';

@Component({
    selector: 'app-alta-mesa',
    templateUrl: './alta-mesa.page.html',
    styleUrls: ['./alta-mesa.page.scss'],
    imports: [IonContent, CommonModule, FormsModule, FormularioAltaMesaComponent, HeaderComponent],
})
export class AltaMesaPage implements OnInit {

    private spinner = inject(SpinnerService)
    private modal = inject(ModalService)

    constructor() {}

    ngOnInit() {}

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
