import { Service, computed, inject, signal } from '@angular/core';
import { DisponibilidadMesa, MesaInterface, TipoMesa } from '../interfaces/mesa.interface';
import { ModalService } from './modal.service';
import { NotificacionesService } from './notificaciones.service';
import { SupabaseService } from './supabase.service';

/**
 * Mesas del salón: consulta, asignación y liberación.
 *
 * La regla central del negocio es que **una mesa pertenece a un solo cliente
 * por vez, y un cliente a una sola mesa**. Todo el cuidado de este servicio
 * apunta a sostener esa condición aunque varios metres trabajen a la vez.
 */

/** Fila cruda de Supabase, en snake_case, antes de traducirla al dominio. */
interface FilaMesa {
    id: string;
    numero_mesa: number;
    cantidad_lugares: number;
    tipo: TipoMesa;
    disponibilidad: DisponibilidadMesa;
    cliente_id: string | null;
    qr_url: string;
    foto_url: string;
}

// Columnas pedidas en cada consulta, declaradas una sola vez para que todas
// devuelvan la misma forma.
const SELECT_MESA = 'id, numero_mesa, cantidad_lugares, tipo, disponibilidad, ' + 'cliente_id, qr_url, foto_url';

@Service()
export class MesaService {
    private modal = inject(ModalService);
    private supabase = inject(SupabaseService);
    private notificaciones = inject(NotificacionesService);

    /** Todas las mesas del salón. */
    mesas = signal<MesaInterface[]>([]);

    /** Bloquea los botones mientras hay una operación en curso. */
    cargando = signal<boolean>(false);

    disponibles = computed(() => this.mesas().filter((m) => m.disponibilidad === 'Disponible'));

    ocupadas = computed(() => this.mesas().filter((m) => m.disponibilidad === 'Ocupada'));

    /** Traduce una fila de la base al modelo que usan las pantallas. */
    private mapear(fila: FilaMesa): MesaInterface {
        return {
            id: fila.id,
            numeroMesa: fila.numero_mesa,
            cantidadLugares: fila.cantidad_lugares,
            tipo: fila.tipo,
            disponibilidad: fila.disponibilidad,
            clienteId: fila.cliente_id,
            qrUrl: fila.qr_url,
            fotoUrl: fila.foto_url,
        };
    }

    private avisarError(error: unknown, alternativa: string): void {
        const mensaje = error instanceof Error ? error.message : alternativa;

        this.modal.setOpen('Error', mensaje);
    }

    /** Trae todas las mesas ordenadas por número, como están en el salón. */
    async listar(): Promise<MesaInterface[] | null> {
        this.cargando.set(true);

        try {
            const { data, error } = await this.supabase
                .from('mesas')
                .select(SELECT_MESA)
                .order('numero_mesa', { ascending: true });

            if (error) throw error;

            this.mesas.set(((data ?? []) as unknown as FilaMesa[]).map((f) => this.mapear(f)));

            return this.mesas();
        } catch (error) {
            this.avisarError(error, 'No se pudieron cargar las mesas.');
            return null;
        } finally {
            this.cargando.set(false);
        }
    }

    // Devuelve la mesa que ya tiene asignada el cliente, si es que tiene.
    // El punto 10 pide poder indicarle cual es en vez de solo negarle el paso.
    mesaDelCliente(clienteId: string): MesaInterface | null {
        return this.mesas().find((m) => m.clienteId === clienteId) ?? null;
    }

    /**
     * Punto 10: el metre asigna una mesa a un cliente registrado.
     *
     * Las tres verificaciones que exige el enunciado:
     *  - el cliente no puede vincularse a otra mesa si ya tiene una;
     *  - esa mesa no se le puede asignar a un segundo cliente;
     *  - se le indica al metre cual es la mesa que ya tiene.
     */
    async asignarCliente(mesaId: string, clienteId: string): Promise<boolean> {
        // Verificación 1: el cliente no puede tener otra mesa. Si la tiene, se
        // le indica cuál es en vez de sólo negarle el paso.
        const yaAsignada = this.mesaDelCliente(clienteId);

        if (yaAsignada && yaAsignada.id !== mesaId) {
            this.modal.setOpen(
                'El cliente ya tiene mesa',
                `Debe dirigirse a la mesa N° ${yaAsignada.numeroMesa}, que ya tiene asignada.`
            );

            return false;
        }

        const mesa = this.mesas().find((m) => m.id === mesaId);

        if (!mesa) {
            this.modal.setOpen('Mesa inexistente', 'La mesa ya no está disponible.');

            return false;
        }

        // Verificación 2: la mesa no puede estar tomada por otro cliente.
        const ocupadaPorOtro = mesa.clienteId !== null && mesa.clienteId !== clienteId;

        if (ocupadaPorOtro || mesa.disponibilidad === 'Ocupada') {
            this.modal.setOpen('Mesa ocupada', `La mesa N° ${mesa.numeroMesa} ya está asignada a otro cliente.`);

            return false;
        }

        this.cargando.set(true);

        try {
            // El filtro por disponibilidad evita que dos metres asignen la
            // misma mesa a la vez: el segundo update no afecta ninguna fila.
            const { data, error } = await this.supabase
                .from('mesas')
                .update({ cliente_id: clienteId, disponibilidad: 'Ocupada' })
                .eq('id', mesaId)
                .eq('disponibilidad', 'Disponible')
                .select('id');

            if (error) throw error;

            if (!data || data.length === 0) {
                this.modal.setOpen('Mesa ocupada', 'Otro usuario tomó esa mesa hace instantes. Elija otra.');

                return false;
            }

            await this.listar();

            // Punto 10: el cliente tiene que enterarse de qué mesa le tocó sin
            // quedarse mirando la pantalla. No hay disparador en la base para
            // esto (sql/notificaciones.sql sólo cubre usuarios y pedidos), así
            // que el aviso sale desde acá.
            //
            // No se espera y se atrapa el rechazo aparte: la mesa ya quedó
            // asignada, y `enviarAvisoAUsuario` lanza si la Edge Function falla.
            // Sin el catch, ese fallo quedaría como un rechazo sin capturar.
            // this.notificaciones
            //     .enviarAvisoAUsuario(
            //         clienteId,
            //         'Mesa asignada',
            //         `Te tocó la mesa N° ${mesa.numeroMesa}. Escaneá su código QR para ver la carta.`,
            //         'mesa-asignada'
            //     )
            //     .catch((error) => console.error('No se pudo avisar al cliente de su mesa:', error));

            return true;
        } catch (error) {
            this.avisarError(error, 'No se pudo asignar la mesa.');

            return false;
        } finally {
            this.cargando.set(false);
        }
    }

    /**
     * Punto 22: al confirmarse el pago la mesa vuelve a estar disponible y sin
     * cliente.
     *
     * Con `clienteId` sólo la libera si sigue ocupada por ese cliente: si dos
     * mozos confirman el mismo pago y entre medio el metre ya la reasignó, el
     * segundo no le saca la mesa al cliente nuevo. Si ya estaba libre, la
     * consulta no afecta ninguna fila, y eso no es un error.
     */
    async liberar(mesaId: string, clienteId?: string): Promise<boolean> {
        // El tipo ata el valor al ENUM de la base. Escrito a mano en minúscula
        // ('disponible'), Postgres lo rechaza y la mesa nunca se libera.
        const libre: { disponibilidad: DisponibilidadMesa; cliente_id: null } = {
            disponibilidad: 'Disponible',
            cliente_id: null,
        };

        try {
            let consulta = this.supabase.from('mesas').update(libre).eq('id', mesaId);

            if (clienteId) consulta = consulta.eq('cliente_id', clienteId);

            const { error } = await consulta;

            if (error) throw error;

            await this.listar();

            return true;
        } catch (error) {
            this.avisarError(error, 'No se pudo liberar la mesa.');

            return false;
        }
    }
}
