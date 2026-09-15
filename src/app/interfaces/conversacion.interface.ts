/**
 * Sala de conversación entre clientes y mozos (punto 11).
 *
 * Tablas: `chats` (una conversación por visita del cliente, atada a su mesa)
 * y `mensajes` (lo que escribe cada uno, cliente o mozo).
 */

export interface MensajeInterface {
    id: string;
    chatId: string;
    autorId: string;
    /** Nombre de quien escribió: la respuesta del mozo tiene que mostrarlo. */
    nombreAutor: string;
    cuerpo: string;
    fecha: string;
}

export interface ChatInterface {
    id: string;
    mesaId: string;
    numeroMesa: number;
    clienteId: string;
    nombreCliente: string;
    fechaApertura: string;
    /** Para el listado del mozo: qué fue lo último que se dijo y cuándo. */
    ultimoMensaje: MensajeInterface | null;
}
