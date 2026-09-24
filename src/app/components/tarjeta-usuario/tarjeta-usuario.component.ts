import { Component, computed, inject, input, output, signal } from '@angular/core';
import { IonBadge } from '@ionic/angular';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

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
    clase?: string;
}

export const ACCIONES_APROBACION: AccionTarjetaUsuario[] = [
    {
        id: 'aceptar',
        etiqueta: 'Aceptar',
        icono: 'circle-check',
        color: 'success',
        clase: 'btn-exito',
    },
    {
        id: 'rechazar',
        etiqueta: 'Rechazar',
        icono: 'circle-xmark',
        color: 'danger',
        clase: 'btn-delete',
    },
];

export const ACCIONES_GESTION: AccionTarjetaUsuario[] = [
    {
        id: 'modificar',
        etiqueta: 'Modificar',
        icono: 'pen-to-square',
        color: 'primary',
        fill: 'outline',
        clase: 'btn-edit',
    },
    {
        id: 'eliminar',
        etiqueta: 'Eliminar',
        icono: 'trash-can',
        color: 'danger',
        fill: 'solid',
        clase: 'btn-delete',
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
    imports: [IonBadge, FaIconComponent],
})
export class TarjetaUsuarioComponent {
    usuario = input.required<ClienteInterface>();
    router = inject(Router);
    rutaActual = signal<string>('');

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
    nombreCompleto = computed(() => {
        if(this.usuario().apellidos){
            return `${this.usuario().apellidos}, ${this.usuario().nombres}`
        }
        return this.usuario().nombres
    });

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

    ngOnInit() {
        this.obtenerRutaActual();
    }

    obtenerRutaActual() {
        // Retorna un string tipo '/home' o '/perfil/usuario'
        const urlActual = this.router.url;
        this.rutaActual.set(urlActual);
    }

    obtenerClaseBoton(accion: AccionTarjetaUsuario): string {
        if (accion.clase) {
            return accion.clase;
        }
        if (accion.id === 'modificar' || accion.id === 'editar') {
            return 'btn-edit';
        }
        if (accion.id === 'eliminar' || accion.id === 'rechazar') {
            return 'btn-delete';
        }
        if (accion.id === 'aceptar' || accion.id === 'aprobar') {
            return 'btn-exito';
        }
        if (accion.fill === 'outline') {
            return 'btn-secundario';
        }
        return 'btn-primario';
    }

    onAccion(accion: string) {
        this.accionSeleccionada.emit({ accion, usuario: this.usuario() });
    }
}
