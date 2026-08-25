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
