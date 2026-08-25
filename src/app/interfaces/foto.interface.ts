export interface FotoInterface {
    previewUrl: string; // Para mostrar en el HTML <img [src]="...">
    blob: Blob;         // Para mandar directo a Supabase
}