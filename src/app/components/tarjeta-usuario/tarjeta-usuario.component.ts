import { Component, computed, input, output } from '@angular/core';
import { IonBadge, IonButton, IonIcon } from '@ionic/angular';
import { ClientePendienteInterface } from '../../interfaces/cliente.interface';

/**
 * Botón configurable de la tarjeta.
 *
 * Recibir las acciones como datos permite que la misma tarjeta sirva para
 * aprobar clientes en una pantalla y seleccionarlos en otra.
 */
export interface AccionTarjetaUsuario {
    id: string;
    etiqueta: string;
    icono: string;
    color: string;
}

/**
 * Tarjeta de usuario reutilizable.
 *
 * Muestra foto, nombre y datos de contacto, con botones configurables. La usan
 * el listado de clientes pendientes y la pantalla de asignación de mesas.
 *
 * Es un componente puramente visual: recibe datos y emite eventos, sin conocer
 * la base ni la lógica de negocio.
 */
@Component({
    selector: 'app-tarjeta-usuario',
    templateUrl: './tarjeta-usuario.component.html',
    styleUrls: ['./tarjeta-usuario.component.scss'],
    imports: [IonBadge, IonButton, IonIcon],
})
export class TarjetaUsuarioComponent {
    usuario = input.required<ClientePendienteInterface>();

    // Las acciones las decide quien usa la tarjeta: aprobar/rechazar en el
    // listado de pendientes, asignar mesa en la pantalla del metre, etc.
    /** Sin acciones la tarjeta es sólo informativa. */
    acciones = input<AccionTarjetaUsuario[]>([]);

    // Datos opcionales: en algunas pantallas solo interesan nombre y foto.
    mostrarContacto = input<boolean>(true);
    mostrarEstado = input<boolean>(false);

    accionSeleccionada = output<{
        accion: string;
        usuario: ClientePendienteInterface;
    }>();

    /** "Apellidos, Nombres": el orden con el que se buscan personas en listas. */
    nombreCompleto = computed(
        () => `${this.usuario().apellidos}, ${this.usuario().nombres}`
    );

    fechaFormateada = computed(() =>
        new Date(this.usuario().fechaRegistro).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    );

    /** Color del distintivo según el estado, para leerlo de un vistazo. */
    colorEstado = computed(() => {
        switch (this.usuario().estado) {
            case 'Activo':
                return 'success';
            case 'Rechazado':
                return 'danger';
            default:
                return 'warning';
        }
    });

    onAccion(accion: string) {
        this.accionSeleccionada.emit({ accion, usuario: this.usuario() });
    }
}
