import { Component, computed, input, OnInit, output } from '@angular/core';
import { EmpleadoInterface } from '../../interfaces/empleado.interface';
import { IonButton, IonBadge } from '@ionic/angular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-tarjeta-empleado',
    templateUrl: './tarjeta-empleado.component.html',
    styleUrls: ['./tarjeta-empleado.component.scss'],
    imports: [IonBadge, IonButton, FaIconComponent],
})
export class TarjetaEmpleadoComponent implements OnInit {
    
    nombreCompleto = computed(() => `${this.usuario().apellidos}, ${this.usuario().nombres}`);
    
    usuario = input.required<EmpleadoInterface>();
    editarEmpleado = output<EmpleadoInterface>();
    eliminarEmpleado = output<EmpleadoInterface>();

    constructor() {}

    ngOnInit() {}

    onEditar() {
        this.editarEmpleado.emit(this.usuario());
    }

    onEliminar() {
        this.eliminarEmpleado.emit(this.usuario());
    }
}
