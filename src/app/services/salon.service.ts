import { Service, inject, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { EstadoEnResto } from '../interfaces/auth.interface';
import { ClienteInterface } from '../interfaces/cliente.interface';
import { visitaReciente } from '../utils/visita';
import { SupabaseService } from './supabase.service';

/**
 * Columna que agrega sql/migracion-fin-de-visita.sql.
 *
 * Hasta que se corre esa migración la columna no existe, y Postgres rechaza
 * cualquier consulta que la nombre. Leerla o escribirla junto con el resto de
 * la fila tumbaría la pantalla de inicio del cliente o la confirmación del
 * pago, así que cada uso tolera que falte: se reintenta sin ella y se avisa en
 * la consola, como hace pedido.service.ts con el estado 'Recibido'.
 */
const COLUMNA_FIN_DE_VISITA = 'fecha_ultima_visita';

/**
 * Códigos con los que Supabase avisa que una columna no existe: 42703 lo da
 * Postgres al leerla, PGRST204 lo da PostgREST al intentar escribirla.
 */
const CODIGOS_COLUMNA_INEXISTENTE = new Set(['42703', 'PGRST204']);

/** Indica si el error se debe a que falta la columna de fin de visita. */
function faltaColumnaFinDeVisita(error: { code?: string; message?: string } | null): boolean {
    if (!error) return false;

    return CODIGOS_COLUMNA_INEXISTENTE.has(String(error.code)) && (error.message ?? '').includes(COLUMNA_FIN_DE_VISITA);
}

function avisarMigracionPendiente(): void {
    console.warn(
        'Falta actualizar la base: para desviar a las encuestas a quien acaba de pagar hay que correr sql/migracion-fin-de-visita.sql en Supabase.'
    );
}

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
    /** Cuándo terminó su última visita; `null` si nunca vino. */
    fechaUltimaVisita: string | null;
}

/** Lo que interesa de la fila que llega por Realtime. */
interface FilaSituacion {
    estado_en_resto: EstadoEnResto;
    mesa_id: string | null;
    /** Ausente mientras no se corra sql/migracion-fin-de-visita.sql. */
    fecha_ultima_visita?: string | null;
}

interface FilaEspera {
    id: string;
    nombres: string;
    apellidos: string | null;
    foto_url: string | null;
    perfil: string;
}

/**
 * Circuito del cliente dentro del salón (puntos 9, 10, 21 y 22 del
 * enunciado): lista de espera, mesa, pago y fin de la visita.
 *
 * La lista de espera no es una tabla: son los usuarios cuyo `estado_en_resto`
 * quedó en 'esperando_mesa'. Modelarlo como un estado y no como una tabla
 * aparte evita que un cliente pueda estar en dos lugares a la vez, que es
 * justamente lo que el enunciado pide impedir.
 */
@Service()
export class SalonService {
    // Inyectado y no importado: así los tests lo reemplazan por un doble
    // con TestBed, sin salir a la red (misma razón que en PedidoService).
    private supabase = inject(SupabaseService);

    /** Situación del cliente que está usando la aplicación. */
    situacion = signal<SituacionCliente | null>(null);

    /** Clientes esperando mesa, para la pantalla del metre. */
    listaEspera = signal<ClienteEnEspera[]>([]);

    private canalSituacion: RealtimeChannel | null = null;
    private canalLista: RealtimeChannel | null = null;

    async cargarSituacion(usuarioId: string): Promise<SituacionCliente | null> {
        let { data, error } = await this.supabase
            .from('usuarios')
            .select(`estado_en_resto, mesa_id, ${COLUMNA_FIN_DE_VISITA}`)
            .eq('id', usuarioId)
            .maybeSingle();

        // Sin la migración, la misma consulta sin la columna nueva: el cliente
        // tiene que poder usar la aplicación igual.
        if (faltaColumnaFinDeVisita(error)) {
            avisarMigracionPendiente();

            ({ data, error } = await this.supabase
                .from('usuarios')
                .select('estado_en_resto, mesa_id')
                .eq('id', usuarioId)
                .maybeSingle());
        }

        if (error) throw error;

        if (!data) {
            this.situacion.set(null);
            return null;
        }

        const situacion = this.aSituacion(data as FilaSituacion);

        this.situacion.set(situacion);

        return situacion;
    }

    /**
     * Indica si el cliente acaba de terminar su visita: ya pagó (está libre) y
     * todavía no pasó la ventana entre visitas.
     *
     * La usan el inicio para ofrecer volver a escanear la mesa, y los lectores
     * de QR para mandarlo a las encuestas en lugar de anotarlo o sentarlo. Se
     * exige además que esté libre: si por algún motivo figura en otro estado,
     * rige el circuito normal.
     */
    acabaDeTerminarSuVisita(ahora: number = Date.now()): boolean {
        const situacion = this.situacion();

        return situacion?.estado === 'libre' && visitaReciente(situacion.fechaUltimaVisita, ahora);
    }

    /** Traduce la fila de la base a la situación que usan las pantallas. */
    private aSituacion(fila: FilaSituacion): SituacionCliente {
        return {
            estado: fila.estado_en_resto,
            mesaId: fila.mesa_id,
            fechaUltimaVisita: fila.fecha_ultima_visita ?? null,
        };
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
        const { data, error } = await this.supabase
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
        const { data, error } = await this.supabase
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
    async clientesParaAsignar(): Promise<ClienteInterface[]> {
        const { data, error } = await this.supabase
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
        const { error } = await this.supabase
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
        const { data, error } = await this.supabase
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

    /**
     * El cliente paga la cuenta y queda esperando que el mozo lo confirme
     * (punto 21).
     *
     * Es el paso que habilita el punto 22: el mozo sólo ve en "Pagos por
     * confirmar" a los clientes en 'pagando'. Como el resto del circuito, la
     * condición va dentro del UPDATE: sólo paga quien está sentado a una mesa.
     *
     * @returns `false` si no estaba sentado, y por lo tanto no había cuenta.
     */
    async pagarCuenta(usuarioId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('usuarios')
            .update({ estado_en_resto: 'pagando' })
            .eq('id', usuarioId)
            .eq('estado_en_resto', 'sentado')
            .select('id');

        if (error) throw error;

        const pagando = (data ?? []).length > 0;

        if (pagando) await this.cargarSituacion(usuarioId);

        return pagando;
    }

    /**
     * Cierra la visita del cliente cuando el mozo confirma el pago (punto 22):
     * queda libre, sin mesa, y se registra cuándo terminó.
     *
     * Esa fecha es la que después miran los lectores de QR para mandarlo a las
     * encuestas en lugar de volver a anotarlo (ver utils/visita.ts).
     *
     * Sólo cierra la visita de quien está pagando. Si dos mozos confirman a la
     * vez, el segundo no afecta ninguna fila y no pisa la fecha del primero.
     */
    async terminarVisita(clienteId: string): Promise<void> {
        const fin = { estado_en_resto: 'libre' as const, mesa_id: null };

        let { error } = await this.supabase
            .from('usuarios')
            .update({ ...fin, [COLUMNA_FIN_DE_VISITA]: new Date().toISOString() })
            .eq('id', clienteId)
            .eq('estado_en_resto', 'pagando');

        // Sin la migración se libera igual al cliente: lo que se pierde es
        // sólo el desvío posterior a las encuestas, no el cobro.
        if (faltaColumnaFinDeVisita(error)) {
            avisarMigracionPendiente();

            ({ error } = await this.supabase
                .from('usuarios')
                .update(fin)
                .eq('id', clienteId)
                .eq('estado_en_resto', 'pagando'));
        }

        if (error) throw error;
    }

    /** Saca al cliente de la lista sin darle mesa (punto 9: poder eliminarlo). */
    async quitarDeListaEspera(clienteId: string): Promise<void> {
        const { error } = await this.supabase
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

        this.canalSituacion = this.supabase.cliente
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
                    // Trae la fila completa: al confirmarse el pago llega junto
                    // con el fin de la visita, sin otra consulta.
                    this.situacion.set(this.aSituacion(mensaje.new as FilaSituacion));
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

        this.canalLista = this.supabase.cliente
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
            await this.supabase.cliente.removeChannel(this.canalSituacion);
            this.canalSituacion = null;
        }

        if (this.canalLista) {
            await this.supabase.cliente.removeChannel(this.canalLista);
            this.canalLista = null;
        }
    }
}
