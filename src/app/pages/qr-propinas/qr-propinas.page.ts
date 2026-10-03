import { Component, inject, signal } from '@angular/core';
import { IonContent, Platform } from '@ionic/angular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { HeaderComponent } from '../../components/header/header.component';
import { ModalService } from '../../services/modal.service';
import { QrService } from '../../services/qr.service';
import { NIVELES_PROPINA, NivelPropina } from '../../utils/propinas';

/**
 * Los cinco códigos QR de propina (puntos 5 y 21).
 *
 * El enunciado pide "cinco códigos QR distintos", uno por nivel de
 * satisfacción, y que estén disponibles para mostrarlos o imprimirlos. Es el
 * mozo quien los lleva a la mesa: el cliente no elige un porcentaje de una
 * lista, escanea el que corresponde a cómo la pasó.
 *
 * Los QR no se guardan en la base, igual que el de ingreso: adentro va sólo
 * `{ "tipo": "propina", "porcentaje": N }`, así que volver a generarlos da
 * exactamente el mismo código. Es el mismo contenido que lee
 * `pedir-cuenta`, que con ese porcentaje arma la cuenta final.
 */
@Component({
    selector: 'app-qr-propinas',
    templateUrl: './qr-propinas.page.html',
    styleUrls: ['../qr-local/qr-local.page.scss', './qr-propinas.page.scss'],
    imports: [IonContent, FaIconComponent, HeaderComponent],
})
export class QrPropinasPage {
    private qrService = inject(QrService);
    private modal = inject(ModalService);
    private platform = inject(Platform);

    readonly niveles = NIVELES_PROPINA;

    /** Nivel que se está mostrando, o null mientras no se eligió ninguno. */
    elegido = signal<NivelPropina | null>(null);

    /** URL temporal en memoria para mostrar el PNG generado. */
    imagenQr = signal<string | null>(null);

    generando = signal(false);

    /** En el celular se comparte; en el navegador se descarga. */
    esNativo = this.platform.is('hybrid');

    private archivo: File | null = null;

    ionViewWillLeave() {
        this.limpiar();
    }

    async mostrar(nivel: NivelPropina) {
        // Tocar dos veces el mismo nivel lo cierra: así se vuelve a ver la
        // lista completa sin tener que salir de la pantalla.
        if (this.elegido()?.porcentaje === nivel.porcentaje) {
            this.limpiar();
            return;
        }

        this.limpiar();
        this.elegido.set(nivel);
        this.generando.set(true);

        try {
            this.archivo = await this.qrService.generateQrFile(
                this.qrService.contenidoPropina(nivel.porcentaje),
                `qr-propina-${nivel.porcentaje}.png`
            );

            this.imagenQr.set(URL.createObjectURL(this.archivo));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo generar el código QR.';

            this.limpiar();
            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.generando.set(false);
        }
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

    /** Suelta la imagen anterior: cada QR nuevo crea una URL en memoria. */
    private limpiar() {
        const url = this.imagenQr();

        if (url) URL.revokeObjectURL(url);

        this.imagenQr.set(null);
        this.elegido.set(null);
        this.archivo = null;
    }
}
