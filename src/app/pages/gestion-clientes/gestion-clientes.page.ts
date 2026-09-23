import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { BotonAccionComponent } from '../../components/boton-accion/boton-accion.component';
import { ClientesService } from '../../services/clientes.service';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { TarjetaUsuarioComponent } from '../../components/tarjeta-usuario/tarjeta-usuario.component';
import { SpinnerService } from '../../services/spinner.service';
import { ModalService } from '../../services/modal.service';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FooterComponent } from '../../components/footer/footer.component';

/**
 * Gestión de clientes para dueño y supervisor (puntos 6, 7 y 8).
 */
@Component({
    selector: 'app-gestion-clientes',
    templateUrl: './gestion-clientes.page.html',
    styleUrls: ['./gestion-clientes.page.scss'],
    imports: [
        IonContent,
        FaIconComponent,
        CommonModule,
        FormsModule,
        HeaderComponent,
        BotonAccionComponent,
        TarjetaUsuarioComponent,
        FooterComponent
    ],
})
export class GestionClientesPage {
    private clientesService = inject(ClientesService);
    private alertCtrl = inject(AlertController);
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);
    private router = inject(Router);

    clientes = signal<ClienteInterface[]>([]);

    ionViewWillEnter() {
        this.cargarClientes();
    }

    async cargarClientes(): Promise<void> {
        this.spinner.show();
        try {
            const clientes = await this.clientesService.getUsuarios('Activo');
            if (!clientes) throw new Error('No se pudieron cargar los clientes');
            this.clientes.set(clientes);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los clientes.';
            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }

    async onAccion(evento: { accion: string; usuario: ClienteInterface }) {
        if (evento.accion === 'modificar') {
            await this.onModificar(evento.usuario);
        } else if (evento.accion === 'eliminar') {
            await this.onEliminar(evento.usuario);
        }
    }

    async onEliminar(cliente: ClienteInterface) {
        const alerta = await this.alertCtrl.create({
            header: 'Eliminar cliente',
            message: `¿Seguro que querés dar de baja a "${cliente.nombres} ${cliente.apellidos}"?`,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    role: 'destructive',
                    handler: () => this.confirmarEliminar(cliente),
                },
            ],
        });

        await alerta.present();
    }

    private async confirmarEliminar(cliente: ClienteInterface) {
        this.spinner.show();
        try {
            await this.clientesService.eliminar(cliente.id);
            this.clientes.update((actuales) => actuales.filter((c) => c.id !== cliente.id));
            this.modal.setOpen('Cliente eliminado', `Se dio de baja a ${cliente.nombres} ${cliente.apellidos}.`);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo eliminar el cliente.';
            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }

    async onModificar(cliente: ClienteInterface) {
        this.router.navigate(['/gestion-clientes/modificar'], {
            queryParams: { clienteId: cliente.id },
        });
    }

    private async confirmarModificar(cliente: ClienteInterface, datos: Partial<ClienteInterface>) {
        this.spinner.show();
        try {
            await this.clientesService.actualizar(cliente.id, datos);
            this.clientes.update((actuales) => actuales.map((c) => (c.id === cliente.id ? { ...c, ...datos } : c)));
            this.modal.setOpen('Cliente actualizado', 'Los datos del cliente se actualizaron correctamente.');
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo actualizar el cliente.';
            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }
}
