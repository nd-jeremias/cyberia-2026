import { Component, effect, inject, input } from '@angular/core';
import { QrCodeComponent } from 'ng-qrcode';
import { QrService } from '../../services/qr.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-qr-generate',
    templateUrl: './qr-generate.component.html',
    styleUrls: ['./qr-generate.component.scss'],
    imports: [FontAwesomeModule, QrCodeComponent],
})
export class QrGenerateComponent {
    faShareNodes = faShareNodes;

    qrService = inject(QrService);

    constructor() {
        // Detecta cambios en el string del QR y genera el archivo para el formulario
        effect(async () => {
            const valorQr = this.qrService.variableQr();
            if (!valorQr) {
                this.qrService.archivoQr.set(null);
                return;
            }

            try {
                // Esperar a que ng-qrcode renderice los píxeles en el DOM
                await new Promise((resolve) => setTimeout(resolve, 150));

                // Generamos el archivo de forma silenciosa
                const file = await this.qrService.generateFileFromElement('qr-container', 'qr-mesa.png');

                // 1. Guardamos la referencia local para los botones
                this.qrService.archivoQr.set(file);

                // 2. Cargamos el archivo en tu formulario
                this.cargarEnFormulario(file);
            } catch (error) {
                console.error('Error al procesar el flujo del QR:', error);
            }
        });
    }

    private cargarEnFormulario(archivo: File) {
        // Tu lógica de Reactive Forms: this.miFormulario.patchValue({ qr: archivo });
        console.log('Formulario actualizado con el archivo:', archivo);
    }
}
