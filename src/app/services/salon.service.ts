import { Service, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
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

/** Lo que interesa de la fila que llega por Realtime. */
interface FilaSituacion {
    estado_en_resto: EstadoEnResto;
    mesa_id: string | null;
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

    private canalSituacion: RealtimeChannel | null = null;
    private canalLista: RealtimeChannel | null = null;

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

    /**
     * El cliente escaneó el QR de su mesa y se sienta (puntos 10 y 11).
     *
     * Las dos condiciones van dentro del UPDATE, no en una lectura previa:
     * tiene que estar en 'mesa_asignada' —o sea, haber pasado por la lista de
     * espera— y la mesa escaneada tiene que ser la suya. Si no se cumple
     * alguna, no se afecta ninguna fila y se devuelve `false`.
     *
     * Resuelto así, dos clientes no pueden sentarse en la misma mesa ni un
     * cliente puede saltearse la lista de espera escaneando una mesa cualquiera.
     */
    async sentarseEnMesa(usuarioId: string, mesaId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('usuarios')
            .update({ estado_en_resto: 'sentado' })
            .eq('id', usuarioId)
            .eq('estado_en_resto', 'mesa_asignada')
            .eq('mesa_id', mesaId)
            .select('id');

        if (error) throw error;

        const sentado = (data ?? []).length > 0;

        if (sentado) await this.cargarSituacion(usuarioId);

        return sentado;
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

    // ----------------------------------------------------------------------
    // Realtime
    //
    // El cliente no puede quedarse mirando una pantalla que no cambia: cuando
    // el metre le asigna una mesa, eso pasa en otro teléfono. Supabase avisa
    // del cambio por websocket y el signal se actualiza solo, así que la
    // pantalla reacciona sin recargar ni preguntar cada tantos segundos.
    //
    // Requiere que la tabla `usuarios` esté publicada para Realtime en el
    // dashboard (Database -> Publications -> supabase_realtime).
    // ----------------------------------------------------------------------

    /** Escucha los cambios de la propia fila del cliente. */
    escucharSituacion(usuarioId: string): void {
        if (this.canalSituacion) return;

        this.canalSituacion = supabase
            .channel(`situacion-${usuarioId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'usuarios',
                    // El filtro va del lado del servidor: este teléfono recibe
                    // sólo los cambios de su propio usuario, no los de todos.
                    filter: `id=eq.${usuarioId}`,
                },
                (mensaje) => {
                    const fila = mensaje.new as FilaSituacion;

                    this.situacion.set({
                        estado: fila.estado_en_resto,
                        mesaId: fila.mesa_id,
                    });
                }
            )
            .subscribe();
    }

    /**
     * Escucha la lista de espera completa, para la pantalla del metre.
     *
     * Acá no se puede filtrar por id: cualquier cliente puede anotarse en
     * cualquier momento. Llega el aviso y se vuelve a pedir la lista, que es
     * más simple y más seguro que ir parcheando el arreglo a mano.
     */
    escucharListaEspera(alCambiar?: () => void): void {
        if (this.canalLista) return;

        this.canalLista = supabase
            .channel('lista-espera')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'usuarios' },
                () => {
                    void this.cargarListaEspera();

                    // La pantalla del metre arma el listado con su propia
                    // consulta, así que se le avisa para que lo rehaga.
                    alCambiar?.();
                }
            )
            .subscribe();
    }

    /** Corta las suscripciones. Se llama al salir de las pantallas. */
    async dejarDeEscuchar(): Promise<void> {
        if (this.canalSituacion) {
            await supabase.removeChannel(this.canalSituacion);
            this.canalSituacion = null;
        }

        if (this.canalLista) {
            await supabase.removeChannel(this.canalLista);
            this.canalLista = null;
        }
    }
}
