export interface LoginInterface {
    email: string;
    password: string;
}

export interface RegisterInterface {
    nombres: string;
    apellidos: string;
    dni: string;
    cuil?: string;
    correo: string;
    tipoEmpleado?: string;
    foto: File[];
    password: string;
    confirmPassword: string;
}

export interface LocalUserInterface{
    id: string;
    correo: string | undefined;
    nombres: string;
}

// Coincide con el enum public.usuarios_rol de la base, más "cliente anónimo"
// (no tiene fila en "usuarios" ni usa Auth, pero necesita su propio set de botones).
export type PerfilUsuario =
    | 'dueño'
    | 'supervisor'
    | 'metre'
    | 'mozo'
    | 'cocinero'
    | 'cantinero'
    | 'cliente registrado'
    | 'cliente anónimo';