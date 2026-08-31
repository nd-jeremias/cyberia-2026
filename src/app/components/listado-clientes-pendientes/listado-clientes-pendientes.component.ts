import { Component, input, output } from '@angular/core';
import { ClientePendienteInterface } from '../../interfaces/cliente.interface';
import {
    AccionTarjetaUsuario,
    TarjetaUsuarioComponent,
} from '../tarjeta-usuario/tarjeta-usuario.component';

const ACCIONES: AccionTarjetaUsuario[] = [
    {
        id: 'aprobar',
        etiqueta: 'Aprobar',
        icono: 'checkmark-circle',
        color: 'success',
    },
    {
        id: 'rechazar',
        etiqueta: 'Rechazar',
        icono: 'close-circle',
        color: 'danger',
    },
];

@Component({
    selector: 'app-listado-clientes-pendientes',
    templateUrl: './listado-clientes-pendientes.component.html',
    styleUrls: ['./listado-clientes-pendientes.component.scss'],
    imports: [TarjetaUsuarioComponent],
})
export class ListadoClientesPendientesComponent {
    clientes = input.required<ClientePendienteInterface[]>();
    tituloListado = input<string>('Clientes pendientes de aprobación');

    aprobarCliente = output<ClientePendienteInterface>();
    rechazarCliente = output<ClientePendienteInterface>();

    acciones = ACCIONES;

    onAccion(evento: { accion: string; usuario: ClientePendienteInterface }) {
        if (evento.accion === 'aprobar') {
            this.aprobarCliente.emit(evento.usuario);
            return;
        }

        this.rechazarCliente.emit(evento.usuario);
    }
}
