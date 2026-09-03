/**
 * Contratos de mesas.
 *
 * Los tipos de unión espejan los ENUM de `sql/mesas.sql`. Escribirlos así hace
 * que el compilador rechace cualquier valor que Postgres también rechazaría,
 * antes de llegar a la base.
 */

export type TipoMesa = 'estándar' | 'VIP' | 'movilidad reducida';

/** Datos que se cargan al dar de alta una mesa (punto 4). */
export interface MesaAltaInterface {
    numeroMesa: number;
    cantidadLugares: number;
    tipo: TipoMesa;
    foto: File;
}

// Refleja el ENUM disponibilidad_mesa de sql/mesas.sql.
export type DisponibilidadMesa = 'disponible' | 'Reservada' | 'ocupada';

/**
 * Mesa completa tal como vive en la base.
 *
 * `clienteId` apunta a `usuarios`, sea el cliente registrado o anónimo: los dos
 * son usuarios de Auth. En NULL, la mesa está libre.
 */
export interface MesaInterface {
    id: string;
    numeroMesa: number;
    cantidadLugares: number;
    tipo: TipoMesa;
    disponibilidad: DisponibilidadMesa;
    clienteId: string | null;
    qrUrl: string;
    fotoUrl: string;
}
