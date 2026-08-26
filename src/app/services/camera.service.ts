import { Service } from '@angular/core';
import { Camera, CameraDirection } from '@capacitor/camera';
import { FotoInterface } from '../interfaces/foto.interface';

export interface FotoCapturada {
    blob: Blob;
    previewUrl: string;
}

@Service()
export class CameraService {
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
