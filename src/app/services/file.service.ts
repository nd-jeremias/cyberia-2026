import { Service } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Service()
export class FileService {
    minLengthArray(min: number) {
        return (control: AbstractControl): ValidationErrors | null => {
            if (control.value && control.value.length >= min) {
                return null; // Es válido
            }
            return { minLengthArray: true }; // Es inválido
        };
    }

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

    isValidTypeImg(file: File): boolean {
        const tiposPermitidos = ['image/png', 'image/jpeg', 'image/webp'];

        return tiposPermitidos.includes(file.type);
    }

    isValidFileSize(file: File, maxSizeMB: number): boolean {
        return file.size <= maxSizeMB * 1024 * 1024;
    }
}
