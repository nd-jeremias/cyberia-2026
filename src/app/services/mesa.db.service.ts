import { inject, Service } from '@angular/core';
import { MesaAltaInterface } from '../interfaces/mesa.interface';
import { supabase } from './supabase.service';
import { GaleriaService } from './galeria.service';
import { QrService } from './qr.service';

@Service()
export class MesaDbService {
    galeriaService = inject(GaleriaService);
    qrService = inject(QrService);

    /**
     * Da de alta una mesa con su código QR (punto 4 del enunciado).
     *
     * El identificador se genera acá y no se deja en manos de la base. Suena al
     * revés, pero es lo que permite que el QR lleve adentro el id definitivo de
     * la mesa: si se esperara al `insert` para conocerlo, habría que generar el
     * QR después y volver a actualizar la fila.
     */
    async altaMesa(mesa: MesaAltaInterface): Promise<void> {
        // Postgres acepta un id propio; su DEFAULT sólo actúa si no se envía.
        const mesaId = crypto.randomUUID();

        // Dentro del QR va únicamente el id. Nada de número, tipo ni cantidad de
        // lugares: son datos editables, y el QR se imprime y se pega en la mesa,
        // así que cualquier cambio posterior dejaría el papel mintiendo.
        const archivoQr = await this.qrService.generateQrFile(
            this.qrService.contenidoMesa(mesaId),
            `mesa-${mesa.numeroMesa}-qr.png`
        );

        // `upsert` en true: el nombre del archivo es fijo por mesa, así que al
        // regenerar el QR de una mesa existente se pisa el anterior en lugar de
        // fallar por duplicado.
        const publicQrUrl = await this.galeriaService.subirImagenDb(archivoQr, 'qr', `${mesaId}-qr.png`, true);

        const promesasDeSubida = mesa.fotos.map((archivo, index) => {
            const extension = archivo.name.split('.').pop() || 'png';
            const nombrePersonalizado = `mesa${mesa.numeroMesa}-foto-${index + 1}.${extension}`;

            return this.galeriaService.subirImagenDb(archivo, 'mesas', nombrePersonalizado, true);
        });

        const urlsPublicas = await Promise.all(promesasDeSubida);

        const { error } = await supabase.from('mesas').insert({
            id: mesaId,
            numero_mesa: mesa.numeroMesa,
            cantidad_lugares: mesa.cantidadLugares,
            tipo: mesa.tipo,
            disponibilidad: 'disponible',
            qr_url: publicQrUrl,
            foto_url: urlsPublicas,
        });

        // Se propaga: antes se registraba en consola y la pantalla mostraba
        // "mesa cargada" aunque no se hubiera guardado nada.
        if (error) throw error;
    }
}
