import { inject, Service } from '@angular/core';
import { MesaAltaInterface, MesaInterface } from '../interfaces/mesa.interface';
import { supabase } from './supabase.service';
import { GaleriaService } from './galeria.service';
import { QrService } from './qr.service';

@Service()
export class MesaDbService {
    galeriaService = inject(GaleriaService);
    qrService = inject(QrService);

    async verificarNumero(mesaNumero: number): Promise<boolean> {
        try {
            const { data, error } = await supabase.from('mesas').select('*').eq('numero_mesa', mesaNumero);
            if (error) throw new Error(error.message);

            if (data.length > 0) return true;

            return false;
        } catch (error) {
            console.log(error);
            throw Error;
        }
    }

    /**
     * Da de alta una mesa con su código QR (punto 4 del enunciado).
     *
     * El identificador se genera acá y no se deja en manos de la base. Suena al
     * revés, pero es lo que permite que el QR lleve adentro el id definitivo de
     * la mesa: si se esperara al `insert` para conocerlo, habría que generar el
     * QR después y volver a actualizar la fila.
     */
    async altaMesa(mesa: MesaAltaInterface): Promise<void> {
        let urlPublica: string | null = null;

        try {
            const existe = await this.verificarNumero(mesa.numeroMesa);
            if (existe) throw new Error('El numero de mesa ya existe');

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
            const publicQrUrl = await this.galeriaService.subirImagenDb(
                archivoQr,
                'qr',
                true,
                `${mesa.numeroMesa}-${mesaId}-qr.png`
            );

            // Las siguientes 3 lineas suben 1 sola img:
            const extension = mesa.fotos.name.split('.').pop() || 'png';
            const nombrePersonalizado = `mesa${mesa.numeroMesa}-foto-${Date.now()}.${extension}`;
            urlPublica = await this.galeriaService.subirImagenDb(mesa.fotos, 'mesas', false, nombrePersonalizado);

            if (!urlPublica) throw Error;

            const { error } = await supabase.from('mesas').insert({
                id: mesaId,
                numero_mesa: mesa.numeroMesa,
                cantidad_lugares: mesa.cantidadLugares,
                tipo: mesa.tipo,
                disponibilidad: 'Disponible',
                qr_url: publicQrUrl,
                foto_url: urlPublica,
            });

            if (error) throw error;
        } catch (error: any) {
            if (urlPublica) {
                const filePath = this.galeriaService.obtenerPathDesdeUrl(urlPublica, 'Fotos');
                if (filePath) {
                    const { error: storageError } = await supabase.storage.from('Fotos').remove([filePath]);

                    if (storageError) {
                        console.error('Error al borrar la foto del bucket:', storageError);
                        throw new Error();
                    }
                }
            }
            console.error('Error en el proceso de creacion de mesa:', error);

            // Extraemos el mensaje de texto del error
            // Si por alguna razón no es un objeto Error, usamos un mensaje genérico por seguridad
            const mensajeAmigable = error instanceof Error ? error.message : 'Ocurrió un error inesperado.';

            // 3. Propagamos el error de forma correcta (Sintaxis válida)
            throw new Error(mensajeAmigable);
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

    mapMesa(row: any): MesaInterface {
        return {
            id: row.id,
            numeroMesa: row.numero_mesa,
            cantidadLugares: row.cantidad_lugares,
            tipo: row.tipo,
            disponibilidad: row.disponibilidad,
            clienteId: row.clienteId,
            qrUrl: row.qr_url,
            fotoUrl: row.foto_url,
        };
    }

    async obtenerPorId(mesaId: string): Promise<MesaInterface> {
        try {
            const { data, error } = await supabase.from('mesas').select('*').eq('id', mesaId).single();
            if (error) throw error;

            return this.mapMesa(data);
        } catch (error) {
            console.log(error);
            throw new Error();
        }
    }

    async editarMesa(id: string, mesa: MesaAltaInterface): Promise<void> {
        try {
            const numeroMesa = mesa.numeroMesa;
            const cantidadLugares = mesa.cantidadLugares;
            const tipo = mesa.tipo;
            const fotoUrl = mesa.fotos;
            const disponibilidad = mesa.disponibilidad;

            const mesaNueva: any = {
                numero_mesa: numeroMesa,
                cantidad_lugares: cantidadLugares,
                tipo,
                disponibilidad,
            };

            if (fotoUrl instanceof File) {
                const publicUrl = await this.galeriaService.subirImagenDb(fotoUrl, 'mesas', true);

                if (!publicUrl) {
                    throw new Error('No se pudo subir la imagen.');
                }

                mesaNueva.foto_url = publicUrl;
            }

            const { error } = await supabase.from('mesas').update(mesaNueva).eq('id', id);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.log(error);
            throw new Error();
        }
    }
}
