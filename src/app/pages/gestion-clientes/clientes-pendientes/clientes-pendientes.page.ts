import { Component, OnInit, inject, signal } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../../components/header/header.component';
import { ListadoClientesPendientesComponent } from '../../../components/listado-clientes-pendientes/listado-clientes-pendientes.component';
import { ClienteInterface } from '../../../interfaces/cliente.interface';
import { ModalService } from '../../../services/modal.service';
import { SpinnerService } from '../../../services/spinner.service';
import { supabase } from '../../../services/supabase.service';
import { ClientesService } from '../../../services/clientes.service';
import { BrevoEmailService } from '../../../services/brevo.email.service';

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
    styleUrls: ['./clientes-pendientes.page.scss'],
    imports: [IonContent, HeaderComponent, ListadoClientesPendientesComponent],
})
export class ClientesPendientesPage implements OnInit {
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);
    emailService = inject(BrevoEmailService);
    clientesService = inject(ClientesService);

    clientes = signal<ClienteInterface[]>([]);

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
            const usuarios = await this.clientesService.getUsuarios('Pendiente');

            this.clientes.set(
                (usuarios ?? []).map((fila) => ({
                    id: fila.id,
                    nombres: fila.nombres,
                    apellidos: fila.apellidos,
                    dni: fila.dni,
                    correo_electronico: fila.correo_electronico,
                    foto_url: fila.foto_url,
                    estado: 'Pendiente',
                    fecha_registro: fila.fecha_registro,
                }))
            );
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo cargar el listado de clientes.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }

    async onAprobar(cliente: ClienteInterface) {
        await this.cambiarEstado(cliente, 'Activo');
    }

    async onRechazar(cliente: ClienteInterface) {
        await this.cambiarEstado(cliente, 'Rechazado');
    }

    /**
     * Aprueba o rechaza una solicitud.
     *
     * Al resolverse, el cliente sale del listado: ya no está pendiente. Se
     * quita de la copia local en vez de recargar todo, que sería más lento.
     */
    private async cambiarEstado(cliente: ClienteInterface, estado: 'Activo' | 'Rechazado') {
        this.spinner.show();

        try {
            const { error } = await supabase.from('usuarios').update({ estado }).eq('id', cliente.id);

            if (error) throw error;

            // Se quita del listado: ya no esta pendiente.
            this.clientes.update((actuales) => actuales.filter((c) => c.id !== cliente.id));
            const nombreEmail = `${cliente.apellidos}, ${cliente.nombres}`;
            const estadoEmail = estado == 'Activo' ? true : false;

            this.emailService.enviarEmailConfirmacion(cliente.correo_electronico, nombreEmail, estadoEmail);

            this.modal.setOpen(
                estado === 'Activo' ? 'Cliente aprobado' : 'Cliente rechazado',
                `${nombreEmail} fue ${
                    estado === 'Activo' ? 'aprobado' : 'rechazado'
                }. Se le enviará un correo con la novedad.`
            );
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo actualizar el estado del cliente.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }
}
