import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MesaService } from '../../services/mesa.service';
import { MesaInterface } from '../../interfaces/mesa.interface';
import { TarjetaMesaComponent } from '../../components/tarjeta-mesa/tarjeta-mesa.component';

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

    mesasCargadas = signal<MesaInterface[]>([]);

    async ngOnInit() {
        const mesas = await this.mesaService.listar();
        if (!mesas) return;
        console.log(mesas)
        this.mesasCargadas.set(mesas);
    }
}
