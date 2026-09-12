import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent, IonIcon } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MesaService } from '../../services/mesa.service';
import { MesaInterface } from '../../interfaces/mesa.interface';
import { TarjetaMesaComponent } from '../../components/tarjeta-mesa/tarjeta-mesa.component';
import { SpinnerService } from '../../services/spinner.service';
import { ModalService } from '../../services/modal.service';
import { MesaDbService } from '../../services/mesa.db.service';

/**
 * Administración de mesas del salón (punto 4).
 *
 * Pantalla todavía sin implementar: por ahora sólo tiene el armazón
 * generado y la ruta declarada.
 */
@Component({
    selector: 'app-gestion-mesas',
    templateUrl: './gestion-mesas.page.html',
    styleUrls: ['./gestion-mesas.page.scss'],
    imports: [IonContent, IonIcon, CommonModule, FormsModule, RouterLink, HeaderComponent, TarjetaMesaComponent],
})
export class GestionMesasPage {
    mesaService = inject(MesaService);
    mesaDbService = inject(MesaDbService);
    router = inject(Router);
    private alertCtrl = inject(AlertController);
    spinner = inject(SpinnerService);
    modal = inject(ModalService);

    mesasCargadas = signal<MesaInterface[]>([]);

    async ngOnInit() {
        const mesas = await this.mesaService.listar();
        if (!mesas) return;
        console.log(mesas);
        this.mesasCargadas.set(mesas);
    }

    /** Abre el QR ya generado de la mesa, para imprimirlo. */
    onVerQr(mesa: MesaInterface) {
        this.router.navigate(['/qr-mesa'], { queryParams: { id: mesa.id } });
    }

    onEditar(mesa: MesaInterface) {
        this.router.navigate(['/gestion-mesas/alta'], { queryParams: { id: mesa.id } });
    }

    private async confirmarEliminar(mesa: MesaInterface) {
        this.spinner.show();

        try {
            await this.mesaDbService.eliminar(mesa.id, mesa.fotoUrl);
            this.mesasCargadas.update((actuales) => actuales.filter((p) => p.id !== mesa.id));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo eliminar el producto.';
            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }

    async onEliminar(mesa: MesaInterface) {
        const alerta = await this.alertCtrl.create({
            header: 'Eliminar mesa',
            message: `¿Seguro que querés eliminar mesa numero: "${mesa.numeroMesa}"?`,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                { text: 'Eliminar', role: 'destructive', handler: () => this.confirmarEliminar(mesa) },
            ],
        });

        await alerta.present();
    }
}
