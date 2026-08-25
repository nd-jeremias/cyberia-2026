export type TipoProducto = 'Comida' | 'Bebida' | 'Postre';

export interface ProductoAltaInterface {
    nombre: string;
    descripcion: string;
    tiempoElaboracionMinutos: number;
    precio: number;
    tipo: TipoProducto;
    fotos: File[];
}
