import { Service } from '@angular/core';
import { Camera, MediaResult, MediaTypeSelection } from '@capacitor/camera';
import { supabase } from './supabase.service';
import { FileObject } from '@supabase/storage-js'

// export interface ImagenGaleria {
//     blob: Blob;
//     previewUrl: string;
//     nombreArchivo: string;
// }

@Service()
export class GaleriaService {
    async subirImagen(maxImg: number = 3): Promise<MediaResult[]> {
        try {
            const { results } = await Camera.chooseFromGallery({
                mediaType: MediaTypeSelection.Photo, // photos, videos, or both
                allowMultipleSelection: true,
                limit: maxImg,
                includeMetadata: true,
            });

            return results;
        } catch (e) {
            const error = e as any;
            const message = error.code ? `[${error.code}] ${error.message}` : error.message;
            console.error('chooseFromGallery failed:', message);
            throw new Error(message);
        }
    }

    /**
     * Sube un archivo al bucket y devuelve su URL pública.
     *
     * `reemplazar` en true pisa el archivo si ya existe. Hace falta cuando el
     * nombre es determinístico (el QR de una mesa, por ejemplo): sin eso, al
     * regenerarlo la subida falla porque el archivo ya está.
     */
    async subirImagenDb(fotoArchivo: File, ruta: string, reemplazar = false, nombre?: string): Promise<string> {
        const nombreNuevo = nombre ? nombre : fotoArchivo.name;
        const rutaArchivo = `${ruta}/${nombreNuevo}`;

        const { error: storageError } = await supabase.storage
            .from('Fotos')
            .upload(rutaArchivo, fotoArchivo, { cacheControl: '3600', upsert: reemplazar });

        if (storageError) throw storageError;

        // Obtener la URL pública del archivo subido
        const { data: urlData } = supabase.storage.from('Fotos').getPublicUrl(rutaArchivo);

        return urlData.publicUrl;
    }

    obtenerPathDesdeUrl(url: string, bucketName: string): string {
        try {
            const urlObjeto = new URL(url);
            const pathname = urlObjeto.pathname; // Devuelve: "/storage/v1/object/public/Fotos/mesas/mesa55-foto-1.jpg"

            // Construimos exactamente el prefijo de la URL pública de Supabase
            const prefijo = `/storage/v1/object/public/${bucketName}/`;

            if (pathname.includes(prefijo)) {
                // Retorna todo lo que esté después de la carpeta del bucket: "mesas/mesa55-foto-1.jpg"
                return pathname.substring(pathname.indexOf(prefijo) + prefijo.length);
            }

            return '';
        } catch (error) {
            console.error('La URL provista no es válida:', error);
            return '';
        }
    }

    parseFotoUrl(raw: unknown): string[] | null {
        if (!raw) return null;

        // Puede venir como array real (columna jsonb bien tipada)
        if (Array.isArray(raw)) return raw as string[];

        // O como string con JSON adentro
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                // URL plana sin JSON.stringify
                return [raw];
            }
        }

        return null;
    }

    async eliminarImgDb(path: string): Promise<FileObject[]> {
        try {
            const { data, error } = await supabase.storage.from('avatars').remove(['folder/avatar2.png']);
            if(error) throw error

            return data
        } catch (error) {
            console.error('Error al eliminar la imagen:', error);
            throw error;
        }
    }
}
