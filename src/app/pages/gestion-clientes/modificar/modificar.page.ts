import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../../components/header/header.component';
import { FormularioRegistroComponent } from '../../../components/formulario-registro/formulario-registro.component';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../services/spinner.service';
import { ModalService } from '../../../services/modal.service';
import { AuthService } from '../../../services/auth.service';
import { ClientesService } from '../../../services/clientes.service';
import { ClienteInterface } from '../../../interfaces/cliente.interface';

@Component({
    selector: 'app-modificar',
    templateUrl: './modificar.page.html',
    styleUrls: ['./modificar.page.scss'],
    imports: [HeaderComponent, FormularioRegistroComponent, IonContent, CommonModule, FormsModule],
})
export class ModificarPage implements OnInit {
    private router = inject(Router);
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);
    private authService = inject(AuthService);
    private clienteService = inject(ClientesService);

    clienteId = input<string | undefined>(undefined);
    clienteExistente = signal<ClienteInterface | undefined>(undefined);
    constructor() {
        effect(() => {
            const id = this.clienteId();
            if (id) this.cargarCliente(id);
        });
    }

    ngOnInit() {}

    private async cargarCliente(id: string) {
        this.spinner.show();

        try {
            const cliente = await this.clienteService.obtenerPorId(id);
            if (!cliente) return;
            this.clienteExistente.set(cliente);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo cargar el empleado.';
            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }

    async handleModificar(formData: FormData) {
        this.spinner.show();

        try {
            const id = this.clienteId();
            const nombre = formData.get('nombres') as String;
            const apellido = formData.get('apellidos') as String;
            if (id) {
                await this.authService.actualizar(id, formData);
                this.modal.setOpen(
                    'Modificacion de datos',
                    `Se modificaron correctamente los datos de:\n ${nombre} ${apellido}.`
                );
            }
            this.router.navigate(['/gestion-clientes']);
        } catch (error: any) {
            console.error('Error en el proceso de registro:', error, 'error');
            this.modal.setOpen('Error', error.message || 'No se pudo completar la modificación');
        } finally {
            this.spinner.hide();
        }
    }
}
