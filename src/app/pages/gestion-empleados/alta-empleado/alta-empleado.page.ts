import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { FormularioRegistroComponent } from '../../../components/formulario-registro/formulario-registro.component';
import { HeaderComponent } from '../../../components/header/header.component';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../services/spinner.service';
import { ModalService } from '../../../services/modal.service';
import { AuthService } from '../../../services/auth.service';
import { EmpleadosService } from '../../../services/empleados.service';
import { EmpleadoInterface } from '../../../interfaces/empleado.interface';

@Component({
    selector: 'app-alta-empleado',
    templateUrl: './alta-empleado.page.html',
    styleUrls: ['./alta-empleado.page.scss'],
    imports: [IonContent, CommonModule, FormsModule, FormularioRegistroComponent, HeaderComponent],
})
export class AltaEmpleadoPage implements OnInit {
    private router = inject(Router);
    private spinner = inject(SpinnerService);
    private modal = inject(ModalService);
    private authService = inject(AuthService);
    empleadoService = inject(EmpleadosService);

    empleadoId = input<string | undefined>(undefined);
    empleadoExistente = signal<EmpleadoInterface | undefined>(undefined);

    constructor() {
        effect(() => {
            const id = this.empleadoId();
            if (id) this.cargarEmpleado(id);
        });
    }

    ngOnInit() {}

    private async cargarEmpleado(id: string) {
        this.spinner.show();

        try {
            const empleado = await this.empleadoService.obtenerPorId(id);
            if (!empleado) return
            this.empleadoExistente.set(empleado);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo cargar el empleado.';
            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }

    async handleRegistro(formData: FormData) {
        this.spinner.show();
        try {
            await this.authService.register(formData);

            const nombre = formData.get('nombre') as String;
            const apellido = formData.get('apellido') as String;
            this.spinner.hide();
            this.modal.setOpen('Registro', `Empleado agregado correctamente:\n ${nombre} ${apellido} dado de alta.`);
            this.router.navigate(['/gestion-empleados']);
        } catch (error: any) {
            this.spinner.hide();
            console.error('Error en el proceso de registro:', error);
            this.modal.setOpen('Error', error.message || 'No se pudo completar el registro');
        }
    }
}
