import { Component, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { ACCIONES_APROBACION, AccionTarjetaUsuario, TarjetaUsuarioComponent } from '../tarjeta-usuario/tarjeta-usuario.component';

/**
 * Botones que ofrece cada fila del listado (Aceptar y Rechazar).
 */
const ACCIONES: AccionTarjetaUsuario[] = ACCIONES_APROBACION;

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
    imports: [IonIcon, TarjetaUsuarioComponent],
})
export class ListadoClientesPendientesComponent {
    /** Los clientes los provee la página; este componente no consulta la base. */
    clientes = input.required<ClienteInterface[]>();
    tituloListado = input<string>('Clientes pendientes de aprobación');

    aprobarCliente = output<ClienteInterface>();
    rechazarCliente = output<ClienteInterface>();

    acciones = ACCIONES;

    /**
     * Traduce la acción genérica de la tarjeta al evento concreto del listado.
     *
     * Así la tarjeta no necesita saber que existen "aprobar" y "rechazar".
     */
    onAccion(evento: { accion: string; usuario: ClienteInterface }) {
        if (evento.accion === 'aceptar' || evento.accion === 'aprobar') {
            this.aprobarCliente.emit(evento.usuario);
            return;
        }

        this.rechazarCliente.emit(evento.usuario);
    }
}
