export type EstadoCliente = 'Pendiente' | 'Activo' | 'Rechazado';

export interface ClientePendienteInterface {
    id: string;
    nombres: string;
    apellidos: string;
    dni: string;
    correo: string;
    fotoUrl: string | null;
    estado: EstadoCliente;
    fechaRegistro: string;
}

export interface AnonimoAltaInterface {
    nombres: string;
    foto: Blob;
}
