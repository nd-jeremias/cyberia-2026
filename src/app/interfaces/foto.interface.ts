/**
 * Foto recién capturada, en los dos formatos que hacen falta.
 *
 * Se llevan ambos porque cumplen funciones distintas y ninguno sirve para las
 * dos: la URL sólo existe en el dispositivo y no se puede subir, y el Blob no
 * se puede mostrar directamente en un <img>.
 */
export interface FotoInterface {
    /** Ruta local para la vista previa: <img [src]="previewUrl">. */
    previewUrl: string;

    /** Contenido binario, listo para subir al bucket de Supabase. */
    blob: Blob;
}
