import { Component, computed, input, output } from '@angular/core';
import { EmpleadoInterface } from '../../interfaces/empleado.interface';
import { IonButton } from '@ionic/angular';

@Component({
    selector: 'app-tarjeta-empleado',
    templateUrl: './tarjeta-empleado.component.html',
    styleUrls: ['./tarjeta-empleado.component.scss'],
    imports: [IonButton],
})
export class TarjetaEmpleadoComponent {
    
    nombreCompleto = computed(() => `${this.usuario().apellidos}, ${this.usuario().nombres}`);
    
    usuario = input.required<EmpleadoInterface>();
    editarEmpleado = output<EmpleadoInterface>();
    eliminarEmpleado = output<EmpleadoInterface>();

    onEditar() {
        this.editarEmpleado.emit(this.usuario());
    }

    onEliminar() {
        this.eliminarEmpleado.emit(this.usuario());
    }
}
