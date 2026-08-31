/**
 * Datos extraídos del código PDF417 del DNI argentino.
 *
 * El enunciado pide un lector de DNI que complete el formulario solo (puntos 1
 * y 5). El documento codifica los campos separados por "@"; el parseo vive en
 * `QrService`.
 */
export interface DniInterface {
    nombres: string;
    apellidos: string;
    genero: string;
    dni: string;
}
