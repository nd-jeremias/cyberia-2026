import { Service, inject, Injectable } from '@angular/core';
import {
    BarcodeScanner,
    ScanResult,
} from '@capacitor-mlkit/barcode-scanning';
import { DniInterface } from '../interfaces/dni.interface';
import { Platform } from '@ionic/angular';
import { Preferences } from '@capacitor/preferences';

@Service()
export class QrService {

    platform = inject(Platform);

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
        const status = await BarcodeScanner.checkPermissions();

        if (status.camera === 'denied' || status.camera === 'prompt') {
            const request = await BarcodeScanner.requestPermissions();
            return request.camera === 'granted';
        }

        return status.camera === 'granted';
    }

    // Iniciar escaneo en tiempo real (Modo Webview Transparente)
    async escanearQR(): Promise<ScanResult | null> {
        try {
            const hasPermission = await this.checkPermissions();
            if (!hasPermission) throw new Error('Permiso de cámara denegado');

            // 💡 Condición: Solo añade la clase transparente si estás corriendo en la App Nativa
            if (this.platform.is('hybrid')) {
                document
                    .querySelector('body')
                    ?.classList.add('barcode-scanner-active');
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
            document
                .querySelector('body')
                ?.classList.remove('barcode-scanner-active');
        }
    }
}
