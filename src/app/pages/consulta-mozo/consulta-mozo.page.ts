import { Component, computed, inject, input, signal } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { SalaConversacionComponent } from '../../components/sala-conversacion/sala-conversacion.component';
import { ChatInterface, MensajeInterface } from '../../interfaces/conversacion.interface';
import { AuthService } from '../../services/auth.service';
import { ConversacionService } from '../../services/conversacion.service';
import { MesaService } from '../../services/mesa.service';
import { ModalService } from '../../services/modal.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { SalonService } from '../../services/salon.service';
import { formatearFechaHora } from '../../utils/fecha';

const ROLES_CLIENTE = ['cliente registrado', 'cliente anónimo'];

/** Estados en los que el cliente ya tiene una mesa a su nombre. */
const ESTADOS_CON_MESA = ['mesa_asignada', 'sentado', 'pagando'];

/** Consultas rápidas: el cliente arranca la conversación con un toque. */
const SUGERENCIAS = ['¿Cuánto falta para mi pedido?', 'Necesito cubiertos', 'Tengo una duda sobre la carta'];

/**
 * Sala de conversación con el mozo (punto 11).
 *
 * La misma pantalla sirve a las dos puntas:
 *
 *   - El CLIENTE entra desde el inicio (`/consulta-mozo`). Sólo puede consultar
 *     con una mesa asignada, porque cada consulta se identifica con el número
 *     de mesa. Su chat se abre recién al mandar el primer mensaje.
 *   - El MOZO entra desde el listado de consultas (`/consulta-mozo?chat=ID`)
 *     y responde en ese chat. Cualquier mozo puede responder cualquier chat.
 *
 * Los mensajes nuevos llegan solos por Realtime. Los push a los mozos y al
 * cliente salen de acá mismo, al guardar cada mensaje (ver avisar()).
 */
@Component({
    selector: 'app-consulta-mozo',
    templateUrl: './consulta-mozo.page.html',
    imports: [IonContent, IonIcon, HeaderComponent, SalaConversacionComponent],
})
export class ConsultaMozoPage {
    private authService = inject(AuthService);
    private conversacion = inject(ConversacionService);
    private salonService = inject(SalonService);
    private mesaService = inject(MesaService);
    private modal = inject(ModalService);
    private notificaciones = inject(NotificacionesService);

    /** Llega por la URL (`?chat=ID`) cuando entra un mozo desde el listado. */
    chat = input<string>();

    readonly sugerencias = SUGERENCIAS;

    cargando = signal(true);
    enviando = signal(false);

    /** El cliente entró sin mesa asignada: no hay a qué mesa atar la consulta. */
    sinMesa = signal(false);

    chatActual = signal<ChatInterface | null>(null);
    mensajes = signal<MensajeInterface[]>([]);

    /** Mesa del cliente. Se conoce antes de que exista el chat. */
    numeroMesa = signal<number | null>(null);
    private mesaId: string | null = null;

    usuarioId = computed(() => this.authService.session()?.user.id ?? null);

    esMozo = computed(() => {
        const perfil = this.authService.perfil();

        return !!this.chat() && !!perfil && !ROLES_CLIENTE.includes(perfil);
    });

    titulo = computed(() => {
        const chat = this.chatActual();

        return this.esMozo() && chat ? `Mesa ${chat.numeroMesa} · ${chat.nombreCliente}` : 'Consulta al mozo';
    });

    /** Para quien atiende, el "volver" lleva al listado de consultas. */
    volverA = computed(() => (this.esMozo() ? '/consultas-clientes' : '/inicio'));

    textoVacio = computed(() =>
        this.esMozo()
            ? 'Esta conversación todavía no tiene mensajes.'
            : `Escribile al mozo desde la mesa ${this.numeroMesa() ?? ''}. Te va a responder por acá.`
    );

    private dejarDeEscuchar: (() => void) | null = null;

    ionViewWillEnter() {
        void this.cargar();
    }

    ionViewWillLeave() {
        this.cortarEscucha();
    }

    private async cargar() {
        const usuarioId = this.usuarioId();

        if (!usuarioId) {
            this.cargando.set(false);
            this.modal.setOpen('Sesión no encontrada', 'Volvé a iniciar sesión para usar el chat.');
            return;
        }

        this.cargando.set(true);
        this.sinMesa.set(false);

        try {
            const chat = this.esMozo()
                ? await this.conversacion.obtenerChat(this.chat()!)
                : await this.chatDelCliente(usuarioId);

            if (this.esMozo() && !chat) {
                this.modal.setOpen('Conversación no encontrada', 'Puede que el cliente ya se haya retirado.');
            }

            await this.mostrarChat(chat);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo abrir la conversación.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.cargando.set(false);
        }
    }

    /**
     * Averigua la mesa del cliente y, si ya consultó en esta visita, su chat.
     * Un chat abierto de otra mesa es de una visita anterior y no se muestra.
     */
    private async chatDelCliente(usuarioId: string): Promise<ChatInterface | null> {
        const situacion = await this.salonService.cargarSituacion(usuarioId);

        if (!situacion?.mesaId || !ESTADOS_CON_MESA.includes(situacion.estado)) {
            this.sinMesa.set(true);
            return null;
        }

        this.mesaId = situacion.mesaId;

        const mesas = await this.mesaService.listar();
        this.numeroMesa.set(mesas?.find((m) => m.id === situacion.mesaId)?.numeroMesa ?? null);

        const chat = await this.conversacion.chatAbiertoDelCliente(usuarioId);

        return chat?.mesaId === situacion.mesaId ? chat : null;
    }

    private async mostrarChat(chat: ChatInterface | null) {
        this.cortarEscucha();
        this.chatActual.set(chat);
        this.mensajes.set([]);

        if (!chat) return;

        this.numeroMesa.set(chat.numeroMesa);

        // Primero se escucha y después se lee: así no se pierde un mensaje que
        // llegue justo entre las dos cosas (agregar() descarta repetidos).
        this.dejarDeEscuchar = this.conversacion.escucharMensajes(chat.id, (mensaje) => this.agregar(mensaje));

        const anteriores = await this.conversacion.mensajesDe(chat.id);
        this.mensajes.update((llegados) => [
            ...anteriores,
            ...llegados.filter((m) => !anteriores.some((a) => a.id === m.id)),
        ]);
    }

    async enviar(cuerpo: string) {
        const usuarioId = this.usuarioId();
        if (!usuarioId || this.enviando()) return;

        this.enviando.set(true);

        try {
            let chat = this.chatActual();

            // Primera consulta del cliente en esta visita: recién ahora se abre.
            if (!chat) {
                if (!this.mesaId) throw new Error('Necesitás una mesa asignada para consultar al mozo.');

                chat = await this.conversacion.abrirChat(usuarioId, this.mesaId);
                await this.mostrarChat(chat);
            }

            const mensaje = await this.conversacion.enviar(chat.id, usuarioId, cuerpo);

            this.agregar(mensaje);
            void this.avisar(chat, mensaje);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo enviar el mensaje.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.enviando.set(false);
        }
    }

    /**
     * Push del punto 11, con la misma función que usa el resto de la app:
     *   - la consulta del cliente les llega a TODOS los mozos, con la mesa y la hora;
     *   - la respuesta del mozo le llega al cliente, con el nombre del mozo y la hora.
     *
     * Va después de guardar y sin esperar: si el aviso falla, el mensaje ya
     * está en el chat y la conversación sigue igual.
     */
    private async avisar(chat: ChatInterface, mensaje: MensajeInterface) {
        const hora = formatearFechaHora(mensaje.fecha);

        try {
            if (mensaje.autorId === chat.clienteId) {
                await this.notificaciones.enviarAvisos(
                    ['mozo'],
                    `Consulta de la mesa ${chat.numeroMesa}`,
                    `${hora} · ${mensaje.cuerpo}`,
                    'consulta-mozo'
                );
            } else {
                await this.notificaciones.enviarAvisoAUsuario(
                    chat.clienteId,
                    `Respuesta de ${mensaje.nombreAutor}`,
                    `${hora} · ${mensaje.cuerpo}`,
                    'consulta-mozo'
                );
            }
        } catch (error) {
            console.error('No se pudo enviar el aviso del chat', error);
        }
    }

    /**
     * El mensaje propio vuelve dos veces: como respuesta del insert y por
     * Realtime. Se agrega una sola, por id.
     */
    private agregar(mensaje: MensajeInterface) {
        this.mensajes.update((actuales) =>
            actuales.some((m) => m.id === mensaje.id) ? actuales : [...actuales, mensaje]
        );
    }

    private cortarEscucha() {
        this.dejarDeEscuchar?.();
        this.dejarDeEscuchar = null;
    }
}
