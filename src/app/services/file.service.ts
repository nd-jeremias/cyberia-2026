import { Service } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Utilidades para trabajar con archivos que sube el usuario.
 *
 * Se agrupan acá para que los formularios no repitan las mismas comprobaciones
 * y para poder cambiar los límites en un solo lugar.
 */
@Service()
export class FileService {
    /**
     * Validador para campos que guardan una lista de archivos.
     *
     * `Validators.required` no sirve acá: un arreglo vacío es un valor
     * presente, así que pasaría la validación sin tener ninguna foto.
     *
     * @param min Cantidad mínima de archivos exigida.
     */
    minLengthArray(min: number) {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && control.value.length >= min) {
                return null; // Es válido
            }
            return { minLengthArray: true }; // Es inválido
        };
    }

    /**
     * Convierte un archivo en una URL de datos para la vista previa.
     *
     * Se usa una promesa porque `FileReader` trabaja por eventos, y así el
     * llamador puede esperarlo con await como cualquier otra operación.
     */
    generatePreview(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                resolve(reader.result as string);
            };

            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
    }

    /**
     * Verifica que el archivo sea una imagen de un formato aceptado.
     *
     * El atributo `accept` del input es sólo una sugerencia del navegador: el
     * usuario puede elegir otro tipo igual, así que hay que comprobarlo.
     */
    isValidTypeImg(file: File): boolean {
        const tiposPermitidos = ['image/png', 'image/jpeg', 'image/webp'];

        return tiposPermitidos.includes(file.type);
    }

    /**
     * Verifica que el archivo no exceda el tamaño máximo.
     *
     * Importa en móvil: una foto de la cámara puede pesar varios megabytes y
     * hacer fallar la subida por tiempo de espera.
     */
    isValidFileSize(file: File, maxSizeMB: number): boolean {
        return file.size <= maxSizeMB * 1024 * 1024;
    }
}
