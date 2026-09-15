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
            // Más nuevo primero: al volver de dar de alta un producto, se lo ve
            // arriba de todo sin tener que buscarlo en la lista.
            .order('fecha_creacion', { ascending: false });

        if (error) throw error;

        return (data ?? []).map(mapearProducto);
    }

    /**
     * Toda la carta de una vez (punto 11).
     *
     * El cliente alterna entre comidas, bebidas y postres mientras arma el
     * pedido, así que se traen los tres tipos juntos y el filtro se resuelve
     * en pantalla: una sola consulta en lugar de una por solapa.
     */
    async listarTodos(): Promise<Producto[]> {
        const { data, error } = await supabase
            .from('productos')
            .select('id, nombre, descripcion, tiempo_elaboracion_minutos, precio, fotos_urls, tipo')
            .order('tipo', { ascending: true })
            .order('nombre', { ascending: true });

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

    // Las fotos que el usuario conservó vienen ya como URLs y las nuevas como
    // archivos: se suben sólo estas últimas y se guardan todas juntas (la
    // tabla exige exactamente tres).
    async actualizar(id: string, datos: ProductoAltaInterface): Promise<void> {
        const urlsNuevas = await this.subirFotos(datos.fotos);
        const fotosUrls = [...(datos.fotosUrlsExistentes ?? []), ...urlsNuevas];

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
