import { Service } from '@angular/core';
import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface ImagenGaleria {
  blob: Blob;
  previewUrl: string;
  nombreArchivo: string;
}

@Injectable({
  providedIn: 'root',
})

@Service()
export class GaleriaService {
    /**
   * Abre la galería del dispositivo para seleccionar una única imagen
   */
  async seleccionarFoto(): Promise<ImagenGaleria | null> {
    try {
      const imagen = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos, // Fuerza la galería/fotos
      });

      if (!imagen.webPath) return null;

      const respuesta = await fetch(imagen.webPath);
      const blob = await respuesta.blob();
      const extension = imagen.format || 'jpg';
      const nombreArchivo = `img_${Date.now()}.${extension}`;

      return {
        blob,
        previewUrl: imagen.webPath,
        nombreArchivo,
      };
    } catch (error) {
      console.warn('Selección de galería cancelada:', error);
      return null;
    }
}

/**
   * Abre la galería permitiendo selección múltiple (para productos o encuestas)
   */
  async seleccionarMultiplesFotos(limite: number = 3): Promise<ImagenGaleria[]> {
    try {
      const { photos } = await Camera.pickImages({
        quality: 85,
        limit: limite,
      });

      const imagenesProcesadas: ImagenGaleria[] = [];

      for (const [index, foto] of photos.entries()) {
        if (foto.webPath) {
          const res = await fetch(foto.webPath);
          const blob = await res.blob();
          const extension = foto.format || 'jpg';

          imagenesProcesadas.push({
            blob,
            previewUrl: foto.webPath,
            nombreArchivo: `img_${Date.now()}_${index}.${extension}`,
          });
        }
      }

      return imagenesProcesadas;
    } catch (error) {
      console.warn('Selección múltiple cancelada:', error);
      return [];
    }
  }
}