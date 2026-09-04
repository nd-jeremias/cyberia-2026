import { Service, inject, signal } from '@angular/core';
import { BarcodeScanner, ScanResult } from '@capacitor-mlkit/barcode-scanning';
import { DniInterface } from '../interfaces/dni.interface';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';
import { ModalService } from './modal.service';
import html2canvas from 'html2canvas';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import * as QRCode from 'qrcode'; // Importamos la librería nativa

@Service()
export class QrService {
    platform = inject(Platform);
    modal = inject(ModalService);

    mostrarQr = signal<boolean>(false);
    variableQr = signal<string>('');
    archivoQr = signal<File | null>(null);
    showedText = signal<string>('');

    parseDNI(data: string | undefined): DniInterface | null {
        if (!data) {
            // this.ui.showToast('Formato DNI no reconocido', 'danger');
            return null;
        }

        const campos = data.split('@');

        if (campos.length >= 5) {
            const data: DniInterface = {
                nombres: campos[2],
                apellidos: campos[1],
                genero: campos[3],
                dni: campos[4],
            };

            return data;
        }

        return null;
    }

    async scanDNI(): Promise<DniInterface | null> {
        try {
            const hasPermission = await this.checkPermissions();
            if (!hasPermission) throw new Error('Permiso de cámara denegado');

            const result = await BarcodeScanner.scan();

            if (result.barcodes.length > 0) {
                const rawValue = result.barcodes[0].rawValue;

                console.log('Código leído:', rawValue);
                return this.parseDNI(rawValue);
            }

            return null;
        } catch (error) {
            throw error;
            //this.ui.showToast('Error escaneando DNI:' + error, 'danger');
        }
    }

    // Verificar y solicitar permisos de la cámara
    async checkPermissions(): Promise<boolean> {
        try {
            const status = await BarcodeScanner.checkPermissions();
            // Si ya está concedido, perfecto
            if (status.camera === 'granted') {
                return true;
            }

            // Si está denegado permanentemente, requestPermissions NO mostrará nada.
            // Debes avisar al usuario que vaya a los ajustes del teléfono.
            if (status.camera === 'denied') {
                console.warn(
                    'El permiso fue denegado previamente. El usuario debe activarlo desde los ajustes de la app.'
                );
                return false;
            }

            // Si está en 'prompt' o 'prompt-with-rationale', se solicita activamente
            if (status.camera === 'prompt' || status.camera === 'prompt-with-rationale') {
                const request = await BarcodeScanner.requestPermissions();
                return request.camera === 'granted';
            }

            return false;
        } catch (error) {
            console.error('Error verificando permisos:', error);
            return false;
        }
    }

    // Iniciar escaneo en tiempo real (Modo Webview Transparente)
    async escanearQR(): Promise<ScanResult | null> {
        try {
            const hasPermission = await this.checkPermissions();
            if (!hasPermission) throw new Error('Permiso de cámara denegado');

            // 💡 Condición: Solo añade la clase transparente si estás corriendo en la App Nativa
            if (this.platform.is('hybrid')) {
                document.querySelector('body')?.classList.add('barcode-scanner-active');
            }

            // Iniciar el lector limitándolo solo a códigos QR (mejora la velocidad)
            // const { barcodes } = await BarcodeScanner.scan({
            //     formats: [BarcodeFormat.QrCode],
            // });

            // // Detener y limpiar
            // this.stopScan();

            // // Retornar el valor del primer QR detectado
            // return barcodes.length > 0 ? barcodes[0].displayValue : null;

            const result: ScanResult | undefined = await BarcodeScanner.scan();

            if (result.barcodes.length > 0) {
                const rawValue = JSON.stringify(result.barcodes[0].rawValue);
                // localStorage.setItem('qr', rawValue);
                await Preferences.set({ key: 'qr', value: rawValue });

                return result;
            }

            return null;
        } catch (error) {
            console.error('Error en escaneo QR:', error);
            return null;
        } finally {
            this.stopScan();
        }
    }

    // 3. Detener escaneo y restaurar la interfaz
    stopScan(): void {
        BarcodeScanner.stopScan();
        if (this.platform.is('hybrid')) {
            document.querySelector('body')?.classList.remove('barcode-scanner-active');
        }
    }

    public async generateQrFile(text: string, fileName: string = 'qr-code.png'): Promise<File> {
        if (!text) {
            throw new Error('El texto para el QR no puede estar vacío');
        }

        try {
            // 1. Generamos el QR directamente como una URL Base64 en memoria
            // Puedes pasarle un objeto de configuración para ajustar tamaño, colores, etc.
            const base64Data = await QRCode.toDataURL(text, {
                width: 300,
                margin: 2,
                errorCorrectionLevel: 'M',
            });

            // 2. Convertimos el string Base64 a un Blob binario
            const blob = await this.base64ToBlob(base64Data);

            // 3. Retornamos el objeto File listo para enviar a Supabase
            return new File([blob], fileName, { type: 'image/png' });
        } catch (error) {
            console.error('Error al generar el QR programático:', error);
            throw error;
        }
    }

    // Método auxiliar para convertir Base64 a Blob de forma eficiente
    private async base64ToBlob(base64WithHeader: string): Promise<Blob> {
        const response = await fetch(base64WithHeader);
        return await response.blob();
    }

    public async shareFile(file: File): Promise<void> {
        try {
            // 1. Convertimos el File a una cadena Base64
            const base64Data = await this.fileToBase64(file);

            // Usamos el nombre del archivo original o uno basado en el timestamp
            const path = `${Date.now()}_${file.name}`;

            // 2. Escribimos el archivo en el directorio de Cache de Capacitor
            const res = await Filesystem.writeFile({
                path,
                data: base64Data,
                directory: Directory.Cache,
            });

            // 3. Abrimos la hoja de compartir nativa del sistema operativo
            await Share.share({
                url: res.uri,
            });

            // 4. Limpiamos la caché eliminando el archivo temporal
            await Filesystem.deleteFile({
                path,
                directory: Directory.Cache,
            });
        } catch (error) {
            console.error('Error al compartir el archivo con Capacitor:', error);
            throw error;
        }
    }

    // Método auxiliar para convertir un File de JS a un string Base64 limpio para Capacitor
    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Filesystem.writeFile requiere solo el string base64 puro,
                // por lo que removemos el prefijo "data:image/png;base64," si existe
                const base64Pure = result.split(',')[1] || result;
                resolve(base64Pure);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // 1. FUNCIÓN PURA: Solo captura el HTML y genera el archivo binario
    public async generateFileFromElement(elementId: string, fileName: string = 'qr-code.png'): Promise<File> {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`No se encontró el elemento con el ID: ${elementId}`);
        }

        const canvas = await html2canvas(element);
        const blob = await this.canvasToBlob(canvas);

        // Retornamos directamente un objeto File listo para formularios o APIs
        return new File([blob], fileName, { type: 'image/png' });
    }

    // 2. ACCIÓN: Descargar un archivo (web)
    public downloadFile(file: File): void {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url); // Liberar memoria
    }

    // Método auxiliar para transformar el Canvas en Blob
    private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('No se pudo convertir el canvas a Blob'));
            }, 'image/png');
        });
    }
}
