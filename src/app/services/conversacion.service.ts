import { Service } from '@angular/core';
import { ChatInterface, MensajeInterface } from '../interfaces/conversacion.interface';
import { supabase } from './supabase.service';

// Se llama "conversación" y no "chat" para no confundirlo con ChartService,
// que es el carrito de la carta.

const SELECT_MENSAJE = 'id, chat_id, autor_id, cuerpo, fecha, usuarios ( nombres, apellidos )';

const SELECT_CHAT = `
    id, mesa_id, cliente_id, fecha_apertura,
    mesas ( numero_mesa ),
    usuarios ( nombres, apellidos ),
    mensajes ( ${SELECT_MENSAJE} )
`;

interface FilaPersona {
    nombres: string | null;
    apellidos: string | null;
}

interface FilaMensaje {
    id: string;
    chat_id: string;
    autor_id: string;
    cuerpo: string;
    fecha: string;
    usuarios: FilaPersona | null;
}

interface FilaChat {
    id: string;
    mesa_id: string;
    cliente_id: string;
    fecha_apertura: string;
    mesas: { numero_mesa: number } | null;
    usuarios: FilaPersona | null;
    mensajes: FilaMensaje[] | null;
}

/** Violación de índice único en Postgres. */
const YA_EXISTE = '23505';

function nombreDe(persona: FilaPersona | null): string {
    const completo = [persona?.nombres, persona?.apellidos].filter(Boolean).join(' ').trim();

    return completo || 'Sin nombre';
}

function mapearMensaje(fila: FilaMensaje): MensajeInterface {
    return {
        id: fila.id,
        chatId: fila.chat_id,
        autorId: fila.autor_id,
        // El mozo se presenta sólo con el nombre, como en una mesa de verdad.
        nombreAutor: fila.usuarios?.nombres?.trim() || 'Sin nombre',
        cuerpo: fila.cuerpo,
        fecha: fila.fecha,
    };
}

function mapearChat(fila: FilaChat): ChatInterface {
    const mensajes = fila.mensajes ?? [];

    return {
        id: fila.id,
        mesaId: fila.mesa_id,
        numeroMesa: fila.mesas?.numero_mesa ?? 0,
        clienteId: fila.cliente_id,
        nombreCliente: nombreDe(fila.usuarios),
        fechaApertura: fila.fecha_apertura,
        // Los mensajes vienen pedidos del más nuevo al más viejo y de a uno.
        ultimoMensaje: mensajes.length > 0 ? mapearMensaje(mensajes[0]) : null,
    };
}

/**
 * Sala de conversación entre clientes y mozos (punto 11).
 *
 * Un chat por visita: el cliente tiene como mucho uno abierto, atado a la mesa
 * que le asignaron. Todos los mozos ven todos los chats y cualquiera responde.
 *
 * Acá sólo se guardan y se leen mensajes. Los push los manda la pantalla
 * (consulta-mozo) con NotificacionesService, después de guardar.
 */
@Service()
export class ConversacionService {
    /** Chat abierto del cliente, o null si todavía no consultó nada. */
    async chatAbiertoDelCliente(clienteId: string): Promise<ChatInterface | null> {
        const { data, error } = await this.consultaChats()
            .eq('cliente_id', clienteId)
            .is('fecha_cierre', null)
            .maybeSingle();

        if (error) throw error;

        return data ? mapearChat(data as unknown as FilaChat) : null;
    }

    async obtenerChat(chatId: string): Promise<ChatInterface | null> {
        const { data, error } = await this.consultaChats().eq('id', chatId).maybeSingle();

        if (error) throw error;

        return data ? mapearChat(data as unknown as FilaChat) : null;
    }

    /**
     * Chats abiertos para la pantalla del mozo, el de la consulta más reciente
     * primero (como la lista de WhatsApp).
     *
     * Los chats sin mensajes no se muestran: no hay nada que responder.
     */
    async listarChatsAbiertos(): Promise<ChatInterface[]> {
        const { data, error } = await this.consultaChats().is('fecha_cierre', null);

        if (error) throw error;

        return ((data ?? []) as unknown as FilaChat[])
            .map(mapearChat)
            .filter((chat) => chat.ultimoMensaje !== null)
            .sort((a, b) => b.ultimoMensaje!.fecha.localeCompare(a.ultimoMensaje!.fecha));
    }

    /**
     * Devuelve el chat del cliente para su mesa actual, creándolo si hace falta.
     *
     * Se llama recién al mandar la primera consulta, no al abrir la pantalla:
     * así el mozo no ve conversaciones vacías de clientes que sólo miraron.
     *
     * Si quedó abierto un chat de otra mesa (una visita anterior), se cierra
     * antes de abrir el nuevo.
     */
    async abrirChat(clienteId: string, mesaId: string): Promise<ChatInterface> {
        const abierto = await this.chatAbiertoDelCliente(clienteId);

        if (abierto?.mesaId === mesaId) return abierto;

        if (abierto) {
            const { error } = await supabase
                .from('chats')
                .update({ fecha_cierre: new Date().toISOString() })
                .eq('id', abierto.id);

            if (error) throw error;
        }

        const { data, error } = await supabase
            .from('chats')
            .insert({ cliente_id: clienteId, mesa_id: mesaId })
            .select('id')
            .single();

        // Otra pantalla del mismo cliente lo abrió a la vez: el índice único
        // frenó el duplicado, así que se usa el que ya quedó creado.
        if (error?.code === YA_EXISTE) {
            const existente = await this.chatAbiertoDelCliente(clienteId);
            if (existente) return existente;
        }

        if (error) throw error;

        const creado = await this.obtenerChat(data.id);
        if (!creado) throw new Error('No se pudo abrir la conversación.');

        return creado;
    }

    /** Toda la conversación, del mensaje más viejo al más nuevo. */
    async mensajesDe(chatId: string): Promise<MensajeInterface[]> {
        const { data, error } = await supabase
            .from('mensajes')
            .select(SELECT_MENSAJE)
            .eq('chat_id', chatId)
            .order('fecha', { ascending: true });

        if (error) throw error;

        return ((data ?? []) as unknown as FilaMensaje[]).map(mapearMensaje);
    }

    async enviar(chatId: string, autorId: string, cuerpo: string): Promise<MensajeInterface> {
        const { data, error } = await supabase
            .from('mensajes')
            .insert({ chat_id: chatId, autor_id: autorId, cuerpo })
            .select(SELECT_MENSAJE)
            .single();

        if (error) throw error;

        return mapearMensaje(data as unknown as FilaMensaje);
    }

    // ----------------------------------------------------------------------
    // Realtime
    //
    // Lo que hace que se sienta como WhatsApp: el mensaje aparece solo en el
    // otro teléfono, sin tocar "actualizar". Requiere que la tabla `mensajes`
    // esté publicada para Realtime (lo hace sql/chat.sql).
    //
    // Cada método devuelve la función que corta la escucha, para que la
    // pantalla la llame al salir.
    // ----------------------------------------------------------------------

    /** Mensajes nuevos de un chat. */
    escucharMensajes(chatId: string, alLlegar: (mensaje: MensajeInterface) => void): () => void {
        const canal = supabase
            .channel(`chat-${chatId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `chat_id=eq.${chatId}` },
                async (cambio) => {
                    // El aviso trae la fila cruda, sin el nombre del autor, que
                    // hace falta para mostrar quién respondió: se vuelve a pedir.
                    const { data } = await supabase
                        .from('mensajes')
                        .select(SELECT_MENSAJE)
                        .eq('id', (cambio.new as { id: string }).id)
                        .maybeSingle();

                    if (data) alLlegar(mapearMensaje(data as unknown as FilaMensaje));
                }
            )
            .subscribe();

        return () => void supabase.removeChannel(canal);
    }

    /** Cualquier mensaje nuevo en cualquier chat, para el listado del mozo. */
    escucharTodosLosMensajes(alCambiar: () => void): () => void {
        const canal = supabase
            .channel('chats-abiertos')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, () => alCambiar())
            .subscribe();

        return () => void supabase.removeChannel(canal);
    }

    private consultaChats() {
        return supabase
            .from('chats')
            .select(SELECT_CHAT)
            .order('fecha', { referencedTable: 'mensajes', ascending: false })
            .limit(1, { referencedTable: 'mensajes' });
    }
}
