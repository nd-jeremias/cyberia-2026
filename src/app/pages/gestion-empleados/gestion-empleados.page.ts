import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { EmpleadosService } from '../../services/empleados.service';
import { EmpleadoInterface } from '../../interfaces/empleado.interface';
import { TarjetaEmpleadoComponent } from '../../components/tarjeta-empleado/tarjeta-empleado.component';
import { SpinnerService } from '../../services/spinner.service';
import { ModalService } from '../../services/modal.service';

/**
 * Alta y administración de empleados (punto 1).
 *
 * Pantalla todavía sin implementar: por ahora sólo tiene el armazón
 * generado y la ruta declarada.
 */
@Component({
    selector: 'app-gestion-empleados',
    templateUrl: './gestion-empleados.page.html',
    styleUrls: ['./gestion-empleados.page.scss'],
    imports: [IonContent, CommonModule, FormsModule, RouterLink, HeaderComponent, TarjetaEmpleadoComponent],
})
export class GestionEmpleadosPage implements OnInit {
    empleadosService = inject(EmpleadosService);
    private alertCtrl = inject(AlertController);
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);
    private router = inject(Router);

    listaEmpleados = signal<EmpleadoInterface[]>([]);

    async ngOnInit(): Promise<void> {
        const data = await this.empleadosService.getEmpleados();
        if (!data) return;

        this.listaEmpleados.set(data);
        console.log(this.listaEmpleados());
    }

    private async confirmarEliminar(empleado: EmpleadoInterface) {
        this.spinner.show();

        try {
            await this.empleadosService.eliminar(empleado.id);
            this.listaEmpleados.update((actuales) => actuales.filter((p) => p.id !== empleado.id));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo eliminar el empleado.';
            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }

    async onEliminar(empleado: EmpleadoInterface) {
        const alerta = await this.alertCtrl.create({
            header: 'Eliminar producto',
            message: `¿Seguro que querés eliminar "${empleado.nombres}" ${empleado.apellidos}?`,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                { text: 'Eliminar', role: 'destructive', handler: () => this.confirmarEliminar(empleado) },
            ],
        });

        await alerta.present();
    }

    async onEditar(empleado: EmpleadoInterface){
        this.router.navigate(['/gestion-empleados/alta'], {
            queryParams: { empleadoId: empleado.id },
        });
    }
}
