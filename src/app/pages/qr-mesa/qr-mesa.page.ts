import { Component, computed, inject, input } from '@angular/core';
import { IonContent, Platform } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { MesaService } from '../../services/mesa.service';
import { ModalService } from '../../services/modal.service';
import { QrService } from '../../services/qr.service';

/**
 * Código QR de una mesa, para imprimirlo y pegarlo (punto 4).
 *
 * A diferencia del QR de ingreso, este no se genera acá: ya se generó al dar de
 * alta la mesa y su imagen vive en el bucket. La pantalla sólo muestra
 * `mesas.qr_url`, así que el código que se imprime es exactamente el mismo que
 * quedó guardado, sin riesgo de que difieran.
 */
@Component({
    selector: 'app-qr-mesa',
    templateUrl: './qr-mesa.page.html',
    styleUrls: ['./qr-mesa.page.scss'],
    imports: [IonContent, HeaderComponent],
})
export class QrMesaPage {
    private mesaService = inject(MesaService);
    private modal = inject(ModalService);
    private qrService = inject(QrService);
    private platform = inject(Platform);

    /** Llega por query param desde el listado de mesas. */
    id = input<string | undefined>(undefined);

    esNativo = this.platform.is('hybrid');

    mesa = computed(() => {
        const id = this.id();

        return id ? this.mesaService.mesas().find((m) => m.id === id) ?? null : null;
    });

    async ionViewWillEnter() {
        if (this.mesaService.mesas().length === 0) {
            await this.mesaService.listar();
        }
    }

    /**
     * Descarga o comparte la imagen del QR.
     *
     * Hay que traerla del bucket antes: lo que tenemos es una URL, y para
     * compartir o descargar hace falta el archivo.
     */
    async guardar() {
        const mesa = this.mesa();

        if (!mesa) return;

        try {
            const respuesta = await fetch(mesa.qrUrl);
            const blob = await respuesta.blob();
            const archivo = new File([blob], `mesa-${mesa.numeroMesa}-qr.png`, { type: 'image/png' });

            if (this.esNativo) {
                await this.qrService.shareFile(archivo);
            } else {
                this.qrService.downloadFile(archivo);
            }
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo descargar el código.';

            this.modal.setOpen('Error', mensaje, 'error');
        }
    }
}
