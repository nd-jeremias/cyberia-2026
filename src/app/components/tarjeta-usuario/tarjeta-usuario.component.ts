import { Component, computed, input, output } from '@angular/core';
import { IonBadge, IonButton, IonIcon } from '@ionic/angular';
import { ClienteInterface } from '../../interfaces/cliente.interface';

/**
 * Botón configurable de la tarjeta.
 *
 * Recibir las acciones como datos permite que la misma tarjeta sirva para
 * aprobar clientes en una pantalla y seleccionarlos en otra.
 */
export type ModoTarjetaUsuario = 'aprobacion' | 'gestion' | 'personalizado';

export interface AccionTarjetaUsuario {
    id: string;
    etiqueta: string;
    icono?: string;
    color?: string;
    fill?: 'clear' | 'outline' | 'solid' | 'default';
}

export const ACCIONES_APROBACION: AccionTarjetaUsuario[] = [
    {
        id: 'aceptar',
        etiqueta: 'Aceptar',
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

export const ACCIONES_GESTION: AccionTarjetaUsuario[] = [
    {
        id: 'modificar',
        etiqueta: 'Modificar',
        icono: 'create-outline',
        color: 'primary',
        fill: 'outline',
    },
    {
        id: 'eliminar',
        etiqueta: 'Eliminar',
        icono: 'trash-outline',
        color: 'danger',
        fill: 'solid',
    },
];

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
    usuario = input.required<ClienteInterface>();

    /**
     * Modo de la tarjeta para usar conjuntos de acciones predefinidos:
     * - 'aprobacion': Muestra "Aceptar" y "Rechazar"
     * - 'gestion': Muestra "Modificar" y "Eliminar"
     * - 'personalizado': Usa las acciones recibidas en el input `acciones`.
     */
    modo = input<ModoTarjetaUsuario>('personalizado');

    // Las acciones las decide quien usa la tarjeta: aprobar/rechazar en el
    // listado de pendientes, asignar mesa en la pantalla del metre, etc.
    /** Acciones personalizadas. Tienen prioridad sobre el modo predeterminado. */
    acciones = input<AccionTarjetaUsuario[]>([]);

    accionesVisibles = computed<AccionTarjetaUsuario[]>(() => {
        if (this.acciones().length > 0) {
            return this.acciones();
        }
        if (this.modo() === 'aprobacion') {
            return ACCIONES_APROBACION;
        }
        if (this.modo() === 'gestion') {
            return ACCIONES_GESTION;
        }
        return [];
    });

    // Datos opcionales: en algunas pantallas solo interesan nombre y foto.
    mostrarContacto = input<boolean>(true);
    mostrarEstado = input<boolean>(false);

    accionSeleccionada = output<{
        accion: string;
        usuario: ClienteInterface;
    }>();

    /** "Apellidos, Nombres": el orden con el que se buscan personas en listas. */
    nombreCompleto = computed(() => `${this.usuario().apellidos}, ${this.usuario().nombres}`);

    fechaFormateada = computed(() =>
        new Date(this.usuario().fecha_registro).toLocaleString('es-AR', {
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
