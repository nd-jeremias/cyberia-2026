/**
 * Contratos de clientes: registrados y anónimos.
 *
 * El enunciado distingue dos tipos que se comportan distinto, pero los dos
 * viven en `usuarios` y se diferencian por su perfil: el registrado necesita
 * aprobación de un dueño o supervisor (punto 5), mientras que el anónimo entra
 * directo con nombre y foto (punto 9), sin mail ni contraseña.
 */

/** Espeja el ENUM `usuarios_estado` de la base. */
export type EstadoCliente = 'Pendiente' | 'Activo' | 'Rechazado';

/**
 * Cliente tal como se lo muestra en los listados de aprobación.
 *
 * `fotoUrl` puede venir vacía: la foto es obligatoria en el formulario, pero
 * un registro cargado a mano en la base podría no tenerla, y la interfaz debe
 * poder mostrarlo igual.
 */
export interface ClientePendienteInterface {
    id: string;
    nombres: string;
    apellidos: string;
    dni: string;
    correo_electronico: string;
    foto_url: string | null;
    estado: EstadoCliente;
    fecha_registro: string;
}

/**
 * Alta de cliente anónimo.
 *
 * Sólo nombre y foto: son los únicos datos que se le piden (punto 9). La foto
 * viaja como Blob porque así la entrega la cámara, lista para subir al bucket.
 */
export interface AnonimoAltaInterface {
    nombres: string;
    foto: File;
}
