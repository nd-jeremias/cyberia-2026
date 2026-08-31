import { Component, computed, input, output } from '@angular/core';
import { IonBadge, IonButton, IonIcon } from '@ionic/angular';
import { ClientePendienteInterface } from '../../interfaces/cliente.interface';

export interface AccionTarjetaUsuario {
    id: string;
    etiqueta: string;
    icono: string;
    color: string;
}

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
    acciones = input<AccionTarjetaUsuario[]>([]);

    // Datos opcionales: en algunas pantallas solo interesan nombre y foto.
    mostrarContacto = input<boolean>(true);
    mostrarEstado = input<boolean>(false);

    accionSeleccionada = output<{
        accion: string;
        usuario: ClientePendienteInterface;
    }>();

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
