export type TipoNotificacion =
    | 'cliente-pendiente'
    | 'mesa-asignada'
    | 'consulta-mozo'
    | 'pedido-nuevo'
    | 'pedido-estado'
    | 'pago';

export interface NotificacionInterface {
    id: string;
    titulo: string;
    cuerpo: string;
    tipo: TipoNotificacion | null;
    datos: Record<string, unknown>;
    fecha: string;
    leida: boolean;
}
