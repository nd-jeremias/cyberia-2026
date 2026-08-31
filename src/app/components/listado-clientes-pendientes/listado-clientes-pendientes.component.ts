import { Component, input, output } from '@angular/core';
import { ClientePendienteInterface } from '../../interfaces/cliente.interface';
import {
    AccionTarjetaUsuario,
    TarjetaUsuarioComponent,
} from '../tarjeta-usuario/tarjeta-usuario.component';

/**
 * Botones que ofrece cada fila del listado.
 *
 * Se declaran como datos y no en la plantilla para que la tarjeta siga siendo
 * genérica: es el listado quien decide qué se puede hacer con cada usuario.
 */
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

/**
 * Listado de clientes esperando aprobación (punto 6 del enunciado).
 *
 * No dibuja la tarjeta: delega en `TarjetaUsuarioComponent`, que se reutiliza
 * también en la pantalla del metre. Acá sólo queda el encabezado, el estado
 * vacío y la traducción de la acción elegida al evento que corresponde.
 */
@Component({
    selector: 'app-listado-clientes-pendientes',
    templateUrl: './listado-clientes-pendientes.component.html',
    styleUrls: ['./listado-clientes-pendientes.component.scss'],
    imports: [TarjetaUsuarioComponent],
})
export class ListadoClientesPendientesComponent {
    /** Los clientes los provee la página; este componente no consulta la base. */
    clientes = input.required<ClientePendienteInterface[]>();
    tituloListado = input<string>('Clientes pendientes de aprobación');

    aprobarCliente = output<ClientePendienteInterface>();
    rechazarCliente = output<ClientePendienteInterface>();

    acciones = ACCIONES;

    /**
     * Traduce la acción genérica de la tarjeta al evento concreto del listado.
     *
     * Así la tarjeta no necesita saber que existen "aprobar" y "rechazar".
     */
    onAccion(evento: { accion: string; usuario: ClientePendienteInterface }) {
        if (evento.accion === 'aprobar') {
            this.aprobarCliente.emit(evento.usuario);
            return;
        }

        this.rechazarCliente.emit(evento.usuario);
    }
}
