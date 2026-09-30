import { Component, inject, signal } from '@angular/core';
import { IonContent, Platform } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { ModalService } from '../../services/modal.service';
import { QrService } from '../../services/qr.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

const NOMBRE_ARCHIVO = 'qr-ingreso-local.png';

/**
 * Código QR de ingreso al local (punto 9 del enunciado).
 *
 * Es uno solo para todo el restaurante y no se guarda en la base: se genera en
 * el momento a partir de un contenido fijo. Guardarlo no aportaría nada, porque
 * volver a generarlo da exactamente el mismo código.
 *
 * La pantalla existe para poder imprimirlo y pegarlo en la puerta, que es lo
 * que pide el enunciado ("tener todos los códigos QR disponibles").
 */
@Component({
    selector: 'app-qr-local',
    templateUrl: './qr-local.page.html',
    styleUrls: ['./qr-local.page.scss'],
    imports: [IonContent, FaIconComponent, HeaderComponent],
})
export class QrLocalPage {
    private qrService = inject(QrService);
    private modal = inject(ModalService);
    private platform = inject(Platform);

    /** URL temporal en memoria para mostrar el PNG generado. */
    imagenQr = signal<string | null>(null);

    /** En el celular se comparte; en el navegador se descarga. */
    esNativo = this.platform.is('hybrid');

    private archivo: File | null = null;

    async ionViewWillEnter() {
        if (this.archivo) return;

        try {
            this.archivo = await this.qrService.generateQrFile(this.qrService.contenidoIngresoLocal(), NOMBRE_ARCHIVO);

            this.imagenQr.set(URL.createObjectURL(this.archivo));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo generar el código QR.';

            this.modal.setOpen('Error', mensaje, 'error');
        }
    }

    ionViewWillLeave() {
        const url = this.imagenQr();

        if (url) URL.revokeObjectURL(url);

        this.imagenQr.set(null);
        this.archivo = null;
    }

    async guardar() {
        if (!this.archivo) return;

        try {
            if (this.esNativo) {
                await this.qrService.shareFile(this.archivo);
            } else {
                this.qrService.downloadFile(this.archivo);
            }
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el código QR.';

            this.modal.setOpen('Error', mensaje, 'error');
        }
    }
}
