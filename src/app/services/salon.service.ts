import { Service, signal } from '@angular/core';
import { EstadoEnResto } from '../interfaces/auth.interface';
import { ClientePendienteInterface } from '../interfaces/cliente.interface';
import { supabase } from './supabase.service';

/** Un cliente esperando mesa, tal como lo ve el metre. */
export interface ClienteEnEspera {
    id: string;
    nombres: string;
    apellidos: string | null;
    fotoUrl: string | null;
    /** Distingue al anónimo del registrado en el listado del metre. */
    esAnonimo: boolean;
}

/** Estado del cliente dentro del local, con la mesa que tenga asignada. */
export interface SituacionCliente {
    estado: EstadoEnResto;
    mesaId: string | null;
}

interface FilaEspera {
    id: string;
    nombres: string;
    apellidos: string | null;
    foto_url: string | null;
    perfil: string;
}

/**
 * Circuito del cliente dentro del salón (puntos 9 y 10 del enunciado).
 *
 * La lista de espera no es una tabla: son los usuarios cuyo `estado_en_resto`
 * quedó en 'esperando_mesa'. Modelarlo como un estado y no como una tabla
 * aparte evita que un cliente pueda estar en dos lugares a la vez, que es
 * justamente lo que el enunciado pide impedir.
 */
@Service()
export class SalonService {
    /** Situación del cliente que está usando la aplicación. */
    situacion = signal<SituacionCliente | null>(null);

    /** Clientes esperando mesa, para la pantalla del metre. */
    listaEspera = signal<ClienteEnEspera[]>([]);

    async cargarSituacion(usuarioId: string): Promise<SituacionCliente | null> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('estado_en_resto, mesa_id')
            .eq('id', usuarioId)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            this.situacion.set(null);
            return null;
        }

        const situacion: SituacionCliente = {
            estado: data.estado_en_resto,
            mesaId: data.mesa_id,
        };

        this.situacion.set(situacion);

        return situacion;
    }

    /**
     * Anota al cliente en la lista de espera (punto 9).
     *
     * La condición `estado_en_resto = 'libre'` va dentro del propio UPDATE: si
     * el cliente ya estaba anotado o ya tiene mesa, la consulta no afecta
     * ninguna fila y se devuelve `false`. Resolverlo en la base y no leyendo
     * antes evita que dos escaneos seguidos lo cuenten dos veces.
     */
    async entrarEnListaDeEspera(usuarioId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('usuarios')
            .update({ estado_en_resto: 'esperando_mesa' })
            .eq('id', usuarioId)
            .eq('estado_en_resto', 'libre')
            .select('id');

        if (error) throw error;

        const anotado = (data ?? []).length > 0;

        if (anotado) await this.cargarSituacion(usuarioId);

        return anotado;
    }

    /** Trae los clientes esperando mesa, del que llegó primero al último. */
    async cargarListaEspera(): Promise<void> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombres, apellidos, foto_url, perfil')
            .eq('estado_en_resto', 'esperando_mesa')
            .order('fecha_registro', { ascending: true });

        if (error) throw error;

        this.listaEspera.set(
            ((data ?? []) as FilaEspera[]).map((fila) => ({
                id: fila.id,
                nombres: fila.nombres,
                apellidos: fila.apellidos,
                fotoUrl: fila.foto_url,
                esAnonimo: fila.perfil === 'cliente anónimo',
            }))
        );
    }

    /**
     * Clientes esperando mesa con los datos que muestra la tarjeta de usuario
     * en la pantalla del metre (punto 10), del que llegó primero al último.
     *
     * Entran los dos perfiles de cliente, porque el anónimo también se anota, y
     * salen solos al recibir mesa: el filtro es el propio estado.
     */
    async clientesParaAsignar(): Promise<ClientePendienteInterface[]> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id, nombres, apellidos, dni, correo_electronico, foto_url, estado, fecha_registro')
            .eq('estado_en_resto', 'esperando_mesa')
            .order('fecha_registro', { ascending: true });

        if (error) throw error;

        return (data ?? []).map((fila) => ({
            id: fila.id,
            nombres: fila.nombres,
            // El cliente anónimo entra sólo con nombre y foto: el resto de los
            // campos vienen en null y la tarjeta los muestra vacíos.
            apellidos: fila.apellidos ?? '',
            dni: fila.dni ?? '',
            correo_electronico: fila.correo_electronico ?? '',
            foto_url: fila.foto_url,
            estado: 'Activo' as const,
            fecha_registro: fila.fecha_registro,
        }));
    }

    /** El metre le asigna una mesa: sale de la lista y queda vinculado (punto 10). */
    async asignarMesa(clienteId: string, mesaId: string): Promise<void> {
        const { error } = await supabase
            .from('usuarios')
            .update({ estado_en_resto: 'mesa_asignada', mesa_id: mesaId })
            .eq('id', clienteId);

        if (error) throw error;

        await this.cargarListaEspera();
    }

    /** Saca al cliente de la lista sin darle mesa (punto 9: poder eliminarlo). */
    async quitarDeListaEspera(clienteId: string): Promise<void> {
        const { error } = await supabase
            .from('usuarios')
            .update({ estado_en_resto: 'libre', mesa_id: null })
            .eq('id', clienteId);

        if (error) throw error;

        await this.cargarListaEspera();
    }
}
