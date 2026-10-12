/**
 * Contratos de las notificaciones push.
 *
 * El backend manda el tipo dentro del campo `data` del mensaje. Es lo que le
 * permite a la aplicación saber a qué pantalla llevar al usuario cuando toca
 * el aviso, en lugar de dejarlo siempre en la misma.
 */

/** Avisos que contempla el enunciado. */
export type TipoNotificacion =
    | 'cliente-pendiente'
    | 'cliente-en-espera'
    | 'mesa-asignada'
    | 'consulta-mozo'
    | 'pedido-nuevo'
    | 'pedido-estado'
    | 'cuenta-solicitada'
    | 'pago';

/** Aviso ya normalizado, listo para mostrarse en la aplicación. */
export interface NotificacionInterface {
    id: string;
    titulo: string;
    cuerpo: string;
    tipo: TipoNotificacion | null;
    datos: Record<string, unknown>;
    fecha: string;
    leida: boolean;
}
