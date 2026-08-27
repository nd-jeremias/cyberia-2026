import { Component, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular';
import { ClientePendienteInterface } from '../../interfaces/cliente.interface';

@Component({
    selector: 'app-listado-clientes-pendientes',
    templateUrl: './listado-clientes-pendientes.component.html',
    styleUrls: ['./listado-clientes-pendientes.component.scss'],
    imports: [IonButton, IonIcon],
})
export class ListadoClientesPendientesComponent {
    clientes = input.required<ClientePendienteInterface[]>();
    tituloListado = input<string>('Clientes pendientes de aprobación');

    aprobarCliente = output<ClientePendienteInterface>();
    rechazarCliente = output<ClientePendienteInterface>();

    nombreCompleto(cliente: ClientePendienteInterface): string {
        return `${cliente.apellidos}, ${cliente.nombres}`;
    }

    fechaFormateada(cliente: ClientePendienteInterface): string {
        return new Date(cliente.fechaRegistro).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    onAprobar(cliente: ClientePendienteInterface) {
        this.aprobarCliente.emit(cliente);
    }

    onRechazar(cliente: ClientePendienteInterface) {
        this.rechazarCliente.emit(cliente);
    }
}
