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