import { Service } from '@angular/core';
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';

export interface FotoCapturada {
  blob: Blob;
  previewUrl: string;
}

@Injectable({
  providedIn: 'root',
})

@Service()
export class CameraService {
    async tomarFoto(direccion: 'frontal' | 'trasera' = 'trasera'): Promise<FotoCapturada | null> {
    try {
      const imagen = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera, // Fuerza el uso de la cámara (sin galería)
        direction: direccion === 'frontal' ? CameraDirection.Front : CameraDirection.Rear,
      });

      if (!imagen.webPath) return null;

      // Convertir webPath a Blob para subida a base de datos / storage
      const respuesta = await fetch(imagen.webPath);
      const blob = await respuesta.blob();

      return {
        blob: blob,
        previewUrl: imagen.webPath,
      };
    } catch (error) {
      console.warn('Captura cancelada o no disponible:', error);
      return null;
    }
  }
}
