/**
 * Contratos de autenticación y registro.
 *
 * Estas formas son las que viajan entre los formularios y los servicios. No
 * son el reflejo de las tablas: la base usa snake_case y cada servicio traduce
 * en su frontera.
 */

/** Credenciales de ingreso. */
export interface LoginInterface {
    email: string;
    password: string;
}

/**
 * Datos del alta de usuario.
 *
 * Sirve tanto para el registro de clientes (punto 5) como para el alta de
 * empleados (punto 1). La diferencia está en los campos opcionales: `cuil` y
 * `tipoEmpleado` sólo se completan cuando lo carga un dueño o supervisor.
 */
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

/** Datos mínimos del usuario que se guardan en el dispositivo. */
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
/**
 * Dónde está parado el cliente dentro del circuito del local.
 *
 * Espeja el ENUM `estado_en_resto` de la base. La lista de espera del metre
 * (punto 9) no es una tabla: son los usuarios en 'esperando_mesa'.
 */
export type EstadoEnResto =
    | 'libre'
    | 'esperando_mesa'
    | 'mesa_asignada'
    | 'sentado'
    | 'pagando';
