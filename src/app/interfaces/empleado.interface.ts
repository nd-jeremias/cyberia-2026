import { PerfilUsuario } from './auth.interface';

export interface EmpleadoInterface {
    id: string;
    nombres: string;
    apellidos: string;
    dni: string;
    cuil: string;
    correo_electronico: string;
    foto_url: string[] | null;
    token_push: string;
    perfil: PerfilUsuario;
    tipoEmpleado: TiposEmpleado
}

export type TiposEmpleado = 'dueño' | 'supervisor' | 'metre' | 'mozo' | 'cocinero' | 'cantinero';
