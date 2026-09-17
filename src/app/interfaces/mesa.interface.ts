/**
 * Contratos de mesas.
 *
 * Los tipos de unión espejan los ENUM de `sql/mesas.sql`. Escribirlos así hace
 * que el compilador rechace cualquier valor que Postgres también rechazaría,
 * antes de llegar a la base.
 */

export type TipoMesa = 'Estándar' | 'VIP' | 'Movilidad reducida';

/** Datos que se cargan al dar de alta una mesa (punto 4). */
export interface MesaAltaInterface {
    numeroMesa: number;
    cantidadLugares: number;
    tipo: TipoMesa;
    fotos: File;
    qrFile: File; // o url, corregir cuando sea necesario
    disponibilidad: string
}

// Refleja el ENUM disponibilidad_mesa de sql/mesas.sql.
export type DisponibilidadMesa = 'Disponible' | 'Reservada' | 'Ocupada';

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
