import { MesaDbService } from './../../../services/mesa.db.service';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { FormularioAltaMesaComponent } from '../../../components/formulario-alta-mesa/formulario-alta-mesa.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { MesaAltaInterface } from '../../../interfaces/mesa.interface';
import { SpinnerService } from '../../../services/spinner.service';
import { ModalService } from '../../../services/modal.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-alta-mesa',
    templateUrl: './alta-mesa.page.html',
    styleUrls: ['./alta-mesa.page.scss'],
    imports: [IonContent, CommonModule, FormsModule, FormularioAltaMesaComponent, HeaderComponent],
})
export class AltaMesaPage implements OnInit {

    private spinner = inject(SpinnerService)
    private modal = inject(ModalService)
    private mesaDbService = inject(MesaDbService)
    private router = inject(Router)

    constructor() {}

    ngOnInit() {}

    async onAltaMesa(mesa: MesaAltaInterface) {
        this.spinner.show();

        try {
            await this.mesaDbService.altaMesa(mesa);
        } catch (error) {
            // Antes no había catch: la pantalla volvía al listado igual y el
            // error se perdía, así que parecía que la mesa se había guardado.
            const mensaje = error instanceof Error ? error.message : 'No se pudo registrar la mesa.';

            this.modal.setOpen('Error', mensaje || 'No se pudo registrar la mesa.');

            return;
        } finally {
            this.spinner.hide();
        }

        this.modal.setOpen('Mesa cargada', `La mesa N° ${mesa.numeroMesa} se registró correctamente.`);
        this.router.navigate(['/gestion-mesas']);
    }
}
