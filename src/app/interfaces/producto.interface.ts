export type TipoProducto = 'Comida' | 'Bebida' | 'Postre';

export interface Producto {
    id: string;
    nombre: string;
    descripcion: string;
    tiempoElaboracionMinutos: number;
    precio: number;
    fotosUrls: string[];
    tipo: TipoProducto;
}

export interface ProductoAltaInterface {
    nombre: string;
    descripcion: string;
    tiempoElaboracionMinutos: number;
    precio: number;
    tipo: TipoProducto;
    fotos: File[];
}

export interface ProductoCarrito {
    id: string;
    nombre: string;
    tiempoElaboracionMinutos: number;
    precioUnitario: number;
    precioTotal: number;
    tipo: TipoProducto;
    cantidad: number;
}
