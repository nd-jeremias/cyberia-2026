export type TipoMesa = 'estándar' | 'VIP' | 'movilidad reducida';

export interface MesaAltaInterface {
    numeroMesa: number;
    cantidadLugares: number;
    tipo: TipoMesa;
    foto: File;
}

// Refleja el ENUM disponibilidad_mesa de sql/mesas.sql.
export type DisponibilidadMesa = 'disponible' | 'Reservada' | 'ocupada';

export interface MesaInterface {
    id: string;
    numeroMesa: number;
    cantidadLugares: number;
    tipo: TipoMesa;
    disponibilidad: DisponibilidadMesa;
    clienteRegistradoId: string | null;
    clienteAnonimoId: string | null;
    qrUrl: string;
    fotoUrl: string;
}
