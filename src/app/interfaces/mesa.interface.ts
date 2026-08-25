export type TipoMesa = 'estándar' | 'VIP' | 'movilidad reducida';

export interface MesaAltaInterface {
    numeroMesa: number;
    cantidadLugares: number;
    tipo: TipoMesa;
    foto: File;
}
