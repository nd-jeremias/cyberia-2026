import { MesaDbService } from './../../../services/mesa.db.service';
import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { FormularioAltaMesaComponent } from '../../../components/formulario-alta-mesa/formulario-alta-mesa.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { MesaAltaInterface, MesaInterface } from '../../../interfaces/mesa.interface';
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
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);
    private mesaDbService = inject(MesaDbService);
    private router = inject(Router);

    mesaId = input<string | undefined>(undefined);
    mesaExistente = signal<MesaInterface | undefined>(undefined);

    titulo = computed(() => (this.mesaId() ? 'Editar mesa' : 'Cargar mesa'));

    constructor() {
        effect(() => {
            const id = this.mesaId();
            if (id) this.cargarMesa(id);
        });
    }

    ngOnInit() {}

    private async cargarMesa(id: string) {
        this.spinner.show();

        try {
            const mesa = await this.mesaDbService.obtenerPorId(id);
            if (!mesa) throw new Error('No se encontró la mesa.');
            console.log(mesa);
            this.mesaExistente.set(mesa);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo cargar el mesa.';
            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }

    async onAltaMesa(mesa: MesaAltaInterface) {
        this.spinner.show();

        const id = this.mesaId();

        try {
            if (id) {
                await this.mesaDbService.editarMesa(id, mesa);
            } else {
                await this.mesaDbService.altaMesa(mesa);
            }
        } catch (error) {
            // Antes no había catch: la pantalla volvía al listado igual y el
            // error se perdía, así que parecía que la mesa se había guardado.
            const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la mesa.';

            this.modal.setOpen('Error', mensaje || 'No se pudo guardar la mesa.', 'error');

            return;
        } finally {
            this.spinner.hide();
        }

        if (id) {
            this.modal.setOpen(
                'Datos modificados.',
                `Se modificaron correctamente los datos de la mesa N° ${mesa.numeroMesa}.`
            );
        } else {
            this.modal.setOpen('Mesa cargada', `La mesa N° ${mesa.numeroMesa} se registró correctamente.`);
        }

        this.router.navigate(['/gestion-mesas']);
    }
}
