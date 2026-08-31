// Reflejan los ENUM de sql/pedidos.sql: cualquier valor fuera de esta lista
// es rechazado por Postgres.
export type EstadoPedido =
    | 'Pendiente de Confirmación'
    | 'Rechazado'
    | 'Confirmado'
    | 'En Preparación'
    | 'Listo para Entregar'
    | 'Entregado'
    | 'Pagado';

export type EstadoItem = 'Pendiente' | 'En Preparación' | 'Listo';

export interface DetallePedidoInterface {
    id: string;
    pedidoId: string;
    productoId: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    precioTotalParcial: number;
    estadoProducto: EstadoItem;
    tiempoElaboracionMinutos: number;
}

export interface PedidoInterface {
    id: string;
    mesaId: string;
    numeroMesa: number;
    clienteRegistradoId: string | null;
    clienteAnonimoId: string | null;
    estado: EstadoPedido;
    precioTotalNeto: number;
    descuentoJuego: number;
    propinaPorcentaje: number;
    fecha: string;
    detalles: DetallePedidoInterface[];
}

export interface ItemNuevoPedido {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
}

export interface NuevoPedidoInterface {
    mesaId: string;
    clienteRegistradoId?: string;
    clienteAnonimoId?: string;
    items: ItemNuevoPedido[];
}
