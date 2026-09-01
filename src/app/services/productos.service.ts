import { Service } from '@angular/core';
import { Producto, ProductoAltaInterface, TipoProducto } from '../interfaces/producto.interface';
import { supabase } from './supabase.service';

const BUCKET_FOTOS = 'Fotos';

// Fila tal cual la devuelve Supabase (columnas en snake_case).
interface ProductoFila {
    id: string;
    nombre: string;
    descripcion: string;
    tiempo_elaboracion_minutos: number;
    precio: number;
    fotos_urls: string[];
    tipo: TipoProducto;
}

function mapearProducto(fila: ProductoFila): Producto {
    return {
        id: fila.id,
        nombre: fila.nombre,
        descripcion: fila.descripcion,
        tiempoElaboracionMinutos: fila.tiempo_elaboracion_minutos,
        precio: fila.precio,
        fotosUrls: fila.fotos_urls,
        tipo: fila.tipo,
    };
}

// Un solo service para todo lo que sea leer/borrar productos: lo usa
// gestion-productos (cocinero/cantinero) y mas adelante el menu del cliente,
// que necesitan la misma consulta filtrada por tipo.
@Service()
export class ProductosService {
    async listarPorTipo(tipo: TipoProducto): Promise<Producto[]> {
        const { data, error } = await supabase
            .from('productos')
            .select('id, nombre, descripcion, tiempo_elaboracion_minutos, precio, fotos_urls, tipo')
            .eq('tipo', tipo)
            .order('nombre');

        if (error) throw error;

        return (data ?? []).map(mapearProducto);
    }

    async obtenerPorId(id: string): Promise<Producto> {
        const { data, error } = await supabase
            .from('productos')
            .select('id, nombre, descripcion, tiempo_elaboracion_minutos, precio, fotos_urls, tipo')
            .eq('id', id)
            .single();

        if (error) throw error;

        return mapearProducto(data);
    }

    async eliminar(id: string): Promise<void> {
        const { error } = await supabase.from('productos').delete().eq('id', id);

        if (error) throw error;
    }

    // Sube cada foto al mismo bucket que usan las fotos de usuario, bajo su
    // propia carpeta, y devuelve las URLs públicas en el mismo orden.
    private async subirFotos(fotos: File[]): Promise<string[]> {
        const urls: string[] = [];

        for (const foto of fotos) {
            const rutaArchivo = `productos/${crypto.randomUUID()}-${foto.name}`;

            const { error: storageError } = await supabase.storage
                .from(BUCKET_FOTOS)
                .upload(rutaArchivo, foto, { cacheControl: '3600', upsert: false });

            if (storageError) throw storageError;

            const { data: urlData } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(rutaArchivo);

            urls.push(urlData.publicUrl);
        }

        return urls;
    }

    async crear(datos: ProductoAltaInterface): Promise<void> {
        const fotosUrls = await this.subirFotos(datos.fotos);

        const { error } = await supabase.from('productos').insert({
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            tiempo_elaboracion_minutos: datos.tiempoElaboracionMinutos,
            precio: datos.precio,
            fotos_urls: fotosUrls,
            tipo: datos.tipo,
        });

        if (error) throw error;
    }

    // Si no se seleccionaron fotos nuevas (fotos.length === 0) se mantienen
    // las que ya tenía el producto; si se seleccionaron, se suben y reemplazan
    // a todas (la tabla exige exactamente 3, no permite un reemplazo parcial).
    async actualizar(id: string, datos: ProductoAltaInterface, fotosUrlsExistentes: string[]): Promise<void> {
        const fotosUrls = datos.fotos.length > 0 ? await this.subirFotos(datos.fotos) : fotosUrlsExistentes;

        const { error } = await supabase
            .from('productos')
            .update({
                nombre: datos.nombre,
                descripcion: datos.descripcion,
                tiempo_elaboracion_minutos: datos.tiempoElaboracionMinutos,
                precio: datos.precio,
                fotos_urls: fotosUrls,
                tipo: datos.tipo,
            })
            .eq('id', id);

        if (error) throw error;
    }
}
