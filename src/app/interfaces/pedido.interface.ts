import { EstadoEnResto } from './auth.interface';

/**
 * Contratos de pedidos.
 *
 * La base separa el pedido en dos tablas: la cabecera (`pedidos`) y las líneas
 * (`pedido_detalles`). Acá se los une en una sola forma, porque ninguna
 * pantalla necesita una sin la otra.
 */

// Reflejan los ENUM de sql/pedidos.sql: cualquier valor fuera de esta lista
// es rechazado por Postgres.
export type EstadoPedido =
    | 'Pendiente de Confirmación'
    | 'Rechazado'
    | 'Confirmado'
    | 'En Preparación'
    | 'Listo para Entregar'
    | 'Entregado'
    | 'Recibido'
    | 'Pagado';

export type EstadoItem = 'Pendiente' | 'En Preparación' | 'Listo';

/** Una línea del pedido: un producto con su cantidad y estado. */
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
    clienteId: string;
    /**
     * Dónde está parado el cliente en el local. Pagar no cambia el pedido sino
     * al cliente ('pagando'): es lo que le dice al mozo qué cobro confirmar.
     */
    estadoCliente: EstadoEnResto | null;
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

/**
 * Pedido a crear.
 *
 * `clienteId` es el usuario que pide, registrado o anónimo. El total no se
 * envía: lo calcula el servicio a partir de los ítems, para que no dependa de
 * lo que informe la pantalla.
 */
export interface NuevoPedidoInterface {
    mesaId: string;
    clienteId: string;
    items: ItemNuevoPedido[];
}
