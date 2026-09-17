import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { ChatInterface } from '../../interfaces/conversacion.interface';
import { ConversacionService } from '../../services/conversacion.service';
import { ModalService } from '../../services/modal.service';
import { formatearFechaHora } from '../../utils/fecha';

/**
 * Consultas de los clientes (punto 11), del lado del mozo.
 *
 * Es la lista de chats de WhatsApp: una fila por mesa que consultó, con lo
 * último que se dijo y a qué hora, la más reciente arriba. Tocar una fila abre
 * la conversación en la misma pantalla que usa el cliente.
 *
 * Todos los mozos ven todas las consultas: la que llegue la atiende quien
 * esté libre. La lista se rehace sola cuando entra un mensaje nuevo.
 */
@Component({
    selector: 'app-consultas-clientes',
    templateUrl: './consultas-clientes.page.html',
    styleUrls: ['./consultas-clientes.page.scss'],
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class ConsultasClientesPage {
    private conversacion = inject(ConversacionService);
    private modal = inject(ModalService);
    private router = inject(Router);

    chats = signal<ChatInterface[]>([]);
    cargando = signal(true);

    private dejarDeEscuchar: (() => void) | null = null;

    ionViewWillEnter() {
        void this.recargar();

        this.dejarDeEscuchar ??= this.conversacion.escucharTodosLosMensajes(() => void this.recargar(false));
    }

    ionViewWillLeave() {
        this.dejarDeEscuchar?.();
        this.dejarDeEscuchar = null;
    }

    /** `mostrarCarga` en false para los refrescos por Realtime: sin parpadeo. */
    async recargar(mostrarCarga = true) {
        if (mostrarCarga) this.cargando.set(true);

        try {
            this.chats.set(await this.conversacion.listarChatsAbiertos());
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudieron traer las consultas.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.cargando.set(false);
        }
    }

    /** Si lo último lo dijo el cliente, la consulta espera respuesta. */
    esperaRespuesta(chat: ChatInterface): boolean {
        return chat.ultimoMensaje?.autorId === chat.clienteId;
    }

    horaDe(chat: ChatInterface): string {
        return chat.ultimoMensaje ? formatearFechaHora(chat.ultimoMensaje.fecha) : '';
    }

    abrir(chat: ChatInterface) {
        void this.router.navigate(['/consulta-mozo'], { queryParams: { chat: chat.id } });
    }
}
