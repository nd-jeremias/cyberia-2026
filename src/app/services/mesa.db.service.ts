import { inject, Service } from '@angular/core';
import { MesaAltaInterface } from '../interfaces/mesa.interface';
import { supabase } from './supabase.service';
import { GaleriaService } from './galeria.service';

@Service()
export class MesaDbService {
    galeriaService = inject(GaleriaService);

    async altaMesa(mesa: MesaAltaInterface) {
        try {
            const publicQrUrl = await this.galeriaService.subirImagenDb(mesa.qrFile, 'qr', `${mesa.numeroMesa}-qr`);
            if (!publicQrUrl) throw Error;

            // Mapeamos el array de Files directamente utilizando el índice para nombrarlos
            const promesasDeSubida = mesa.fotos.map((archivo, index) => {
                // Genera nombres automáticos: 'foto-1.png', 'foto-2.png', etc.
                // Manteniendo la extensión original del archivo subido
                const extension = archivo.name.split('.').pop() || 'png';
                const nombrePersonalizado = `mesa${mesa.numeroMesa}-foto-${index + 1}.${extension}`;

                // Llamamos directamente a tu función existente
                return this.galeriaService.subirImagenDb(archivo, 'mesas', nombrePersonalizado);
            });

            // Ejecutamos las subidas en paralelo
            const urlsPublicas = await Promise.all(promesasDeSubida);

            console.log('Todas las URLs subidas:', urlsPublicas);

            // Guardar en la base de datos pasándole el array completo de URLs
            // await this.guardarUrlsEnBaseDeDatos(idMesa, urlsPublicas);
        } catch (error) {
            console.log(error)
        }

        // const { data, error } = await supabase.from('mesas').insert({
        //     numero_mesa: mesa.numeroMesa,
        //     cantidad_lugares: mesa.cantidadLugares,
        //     tipo: mesa.tipo,
        //     disponibilidad: 'disponible',
        //     qr_url: mesa.qrFile
        //     foto_url: mesa.fotos
        // })
    }
}
