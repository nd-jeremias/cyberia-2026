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
            // const promesasDeSubida = mesa.fotos.map((archivo, index) => {
            //     // Genera nombres automáticos: 'foto-1.png', 'foto-2.png', etc.
            //     // Manteniendo la extensión original del archivo subido
            //     const extension = archivo.name.split('.').pop() || 'png';
            //     const nombrePersonalizado = `mesa${mesa.numeroMesa}-foto-${index + 1}.${extension}`;

            //     // Llamamos directamente a tu función existente
            //     return this.galeriaService.subirImagenDb(archivo, 'mesas', nombrePersonalizado);
            // });

            // Ejecutamos las subidas en paralelo
            // const urlsPublicas = await Promise.all(promesasDeSubida);

            // Las siguientes 3 lineas suben 1 sola img:
            const extension = mesa.fotos.name.split('.').pop() || 'png';
            const nombrePersonalizado = `mesa${mesa.numeroMesa}-foto-${Date.now()}.${extension}`;
            const urlsPublicas = await this.galeriaService.subirImagenDb(mesa.fotos, 'mesas', nombrePersonalizado);

            if (!urlsPublicas) throw Error;

            const { error } = await supabase.from('mesas').insert({
                numero_mesa: mesa.numeroMesa,
                cantidad_lugares: mesa.cantidadLugares,
                tipo: mesa.tipo,
                disponibilidad: 'disponible',
                qr_url: publicQrUrl,
                foto_url: urlsPublicas,
            });

            if (error) throw error;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async eliminar(mesaId: string, fotoUrl: string) {
        // 1. Si la mesa tiene foto, la borramos primero del bucket
        if (fotoUrl) {
            const filePath = this.galeriaService.obtenerPathDesdeUrl(fotoUrl, 'Fotos');
            if (filePath) {
                const { error: storageError } = await supabase.storage.from('Fotos').remove([filePath]); // Recibe un array de rutas

                if (storageError) {
                    console.error('Error al borrar la foto del bucket:', storageError);
                    throw new Error();
                }
            }
        }

        // 2. Procedemos a borrar el registro de la mesa en la base de datos
        const { error: dbError } = await supabase.from('mesas').delete().eq('id', mesaId);

        if (dbError) throw dbError;
    }
}
