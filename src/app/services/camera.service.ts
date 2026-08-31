import { Service } from '@angular/core';
import { Camera, CameraDirection } from '@capacitor/camera';
import { FotoInterface } from '../interfaces/foto.interface';

/**
 * @deprecated Duplica a `FotoInterface`. Se conserva por compatibilidad;
 * conviene usar `FotoInterface` en el código nuevo.
 */
export interface FotoCapturada {
    blob: Blob;
    previewUrl: string;
}

/**
 * Captura de fotos con la cámara del dispositivo.
 *
 * El enunciado exige que ciertas fotos se tomen con la cámara y no se elijan de
 * la galería (puntos 1 y 5), de ahí que exista este servicio separado del de
 * galería.
 *
 * Sólo funciona en la aplicación compilada: en el navegador el plugin nativo
 * no está disponible.
 */
@Service()
export class CameraService {
    /**
     * Abre la cámara y devuelve la foto en los dos formatos que se necesitan.
     *
     * @param direccion `'frontal'` para selfies de registro, `'trasera'` para
     *                  fotografiar productos o mesas.
     * @returns La foto capturada, o `null` si no se pudo obtener la ruta.
     * @throws Si el usuario cancela o deniega el permiso. Quien llama debe
     *         distinguir ambos casos: cancelar no es un error que avisar.
     */
    async tomarFoto(
        direccion: 'frontal' | 'trasera'
    ): Promise<FotoInterface | null> {
        const cameraDir =
            direccion === 'frontal'
                ? CameraDirection.Front
                : CameraDirection.Rear;

        try {
            const photo = await Camera.takePhoto({
                quality: 90,
                editable: 'no',
                cameraDirection: cameraDir,
            });

            if (!photo.webPath)
                throw new Error('No se pudo obtener el path de la foto');

            // Convertimos el webPath en un Blob real de forma ultra eficiente
            const response = await fetch(photo.webPath);
            const blob = await response.blob();

            return {
                previewUrl: photo.webPath, // Ruta local segura para la vista previa
                blob: blob, // Archivo binario listo para Supabase
            };
        } catch (error) {
            console.error('Error al tomar foto en servicio:', error);
            throw error;
        }
    }
}
