import { Component, OnInit, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { ListadoClientesPendientesComponent } from '../../components/listado-clientes-pendientes/listado-clientes-pendientes.component';
import { ClientePendienteInterface } from '../../interfaces/cliente.interface';
import { ModalService } from '../../services/modal.service';
import { SpinnerService } from '../../services/spinner.service';
import { supabase } from '../../services/supabase.service';

/**
 * Aprobación de clientes registrados (puntos 6, 7 y 8 del enunciado).
 *
 * Sólo dueño y supervisor deberían llegar acá. Al aprobar o rechazar, un
 * disparador de la base envía el correo automático y la notificación push; por
 * eso esta pantalla sólo cambia el estado y no se ocupa del aviso.
 */
@Component({
    selector: 'app-clientes-pendientes',
    templateUrl: './clientes-pendientes.page.html',
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        ListadoClientesPendientesComponent,
    ],
})
export class ClientesPendientesPage implements OnInit {
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);

    clientes = signal<ClientePendienteInterface[]>([]);

    ngOnInit() {
        this.cargar();
    }

/**
     * Trae las solicitudes en espera, de la más antigua a la más reciente.
     *
     * El orden importa: quien pidió primero debería resolverse primero.
     */
    async cargar() {
        this.spinner.show();

        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select(
                    'id, nombres, apellidos, dni, correo_electronico, foto_url, estado, fecha_registro'
                )
                .eq('estado', 'Pendiente')
                .order('fecha_registro', { ascending: true });

            if (error) throw error;

            this.clientes.set(
                (data ?? []).map((fila) => ({
                    id: fila.id,
                    nombres: fila.nombres,
                    apellidos: fila.apellidos,
                    dni: fila.dni,
                    correo: fila.correo_electronico,
                    fotoUrl: fila.foto_url,
                    estado: 'Pendiente',
                    fechaRegistro: fila.fecha_registro,
                }))
            );
        } catch (error) {
            const mensaje =
                error instanceof Error
                    ? error.message
                    : 'No se pudo cargar el listado de clientes.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }

    async onAprobar(cliente: ClientePendienteInterface) {
        await this.cambiarEstado(cliente, 'Activo');
    }

    async onRechazar(cliente: ClientePendienteInterface) {
        await this.cambiarEstado(cliente, 'Rechazado');
    }

    /**
     * Aprueba o rechaza una solicitud.
     *
     * Al resolverse, el cliente sale del listado: ya no está pendiente. Se
     * quita de la copia local en vez de recargar todo, que sería más lento.
     */
    private async cambiarEstado(
        cliente: ClientePendienteInterface,
        estado: 'Activo' | 'Rechazado'
    ) {
        this.spinner.show();

        try {
            const { error } = await supabase
                .from('usuarios')
                .update({ estado })
                .eq('id', cliente.id);

            if (error) throw error;

            // Se quita del listado: ya no esta pendiente.
            this.clientes.update((actuales) =>
                actuales.filter((c) => c.id !== cliente.id)
            );

            this.modal.setOpen(
                estado === 'Activo' ? 'Cliente aprobado' : 'Cliente rechazado',
                `${cliente.apellidos}, ${cliente.nombres} fue ${
                    estado === 'Activo' ? 'aprobado' : 'rechazado'
                }. Se le enviará un correo con la novedad.`
            );
        } catch (error) {
            const mensaje =
                error instanceof Error
                    ? error.message
                    : 'No se pudo actualizar el estado del cliente.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }
}
