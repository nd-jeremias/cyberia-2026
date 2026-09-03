/**
 * Contratos de productos de la carta.
 *
 * Hay tres formas distintas del mismo concepto, y cada una existe por un
 * motivo: `Producto` es lo que devuelve la base, `ProductoAltaInterface` lo que
 * se carga en el formulario (todavía sin id ni URLs), y `ProductoCarrito` lo
 * que el cliente eligió, con cantidad y subtotal.
 */

/** Espeja el ENUM `tipo_producto` de la base. */
export type TipoProducto = 'Comida' | 'Bebida' | 'Postre';

/** Producto ya guardado, tal como se lo muestra en la carta. */
export interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    tiempoElaboracionMinutos: number;
    precio: number;
    fotosUrls: string[];
    tipo: TipoProducto;
}

/**
 * Datos del alta de un producto (puntos 2 y 3).
 *
 * Las fotos viajan como archivos porque todavía no se subieron; una vez en el
 * bucket pasan a ser las `fotosUrls` de `Producto`.
 */
export interface ProductoAltaInterface {
    nombre: string;
    descripcion: string;
    tiempoElaboracionMinutos: number;
    precio: number;
    tipo: TipoProducto;
    fotos: File[];
    /**
     * Sólo en edición: fotos ya subidas que el usuario decidió conservar. Se
     * suman a las nuevas de `fotos` y entre las dos tienen que dar las tres
     * que exige la tabla.
     */
    fotosUrlsExistentes?: string[];
}

/**
 * Línea del pedido en armado.
 *
 * El precio unitario se copia al agregarlo: si el dueño cambia el precio
 * mientras el cliente elige, la cuenta debe respetar el que vio.
 */
export interface ProductoCarrito {
    id: string;
    nombre: string;
    tiempoElaboracionMinutos: number;
    precioUnitario: number;
    precioTotal: number;
    tipo: TipoProducto;
    cantidad: number;
}
