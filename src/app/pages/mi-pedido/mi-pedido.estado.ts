import { EstadoEnResto, PerfilUsuario } from '../../interfaces/auth.interface';
import { EstadoPedido } from '../../interfaces/pedido.interface';

/**
 * Reglas de la pantalla "Mi pedido", separadas del componente.
 *
 * Son funciones puras: dependen sólo de sus argumentos, así que se prueban sin
 * montar la pantalla ni tocar la base.
 */

/** Qué decirle al cliente según en qué punto está su pedido. */
export const LEYENDA_PEDIDO: Record<EstadoPedido, string> = {
    'Pendiente de Confirmación': 'Enviaste tu pedido. El mozo lo está revisando.',
    Rechazado: 'El mozo pidió cambios en tu pedido. Corregilo y volvé a enviarlo.',
    Confirmado: 'El mozo confirmó tu pedido y ya pasó a cocina y barra.',
    'En Preparación': 'Tu pedido se está preparando.',
    'Listo para Entregar': 'Tu pedido está listo. El mozo te lo lleva enseguida.',
    Entregado: 'El mozo te llevó el pedido. Confirmá que lo recibiste.',
    Recibido: 'Recibiste tu pedido. ¡Buen provecho!',
    Pagado: 'Tu cuenta ya fue pagada. ¡Gracias por venir!',
};

/**
 * Leyenda mientras el mozo cobra. Pagar no cambia el pedido sino al cliente,
 * que queda 'pagando' hasta que el mozo confirma (puntos 21 y 22).
 */
export const LEYENDA_PAGANDO = 'Pediste la cuenta. Esperá a que el mozo confirme el pago.';

/**
 * Estados de un pedido que el mozo ya confirmó: la comanda pasó a cocina y
 * barra (punto 14) y de ahí en adelante. Deciden dos cosas a la vez: desde acá
 * se habilitan los juegos, y desde acá ya no se puede mandar otro pedido.
 */
const ESTADOS_CONFIRMADOS: ReadonlySet<EstadoPedido> = new Set<EstadoPedido>([
    'Confirmado',
    'En Preparación',
    'Listo para Entregar',
    'Entregado',
    'Recibido',
]);

/**
 * Punto 15: sólo el cliente registrado juega por descuentos (el anónimo no, lo
 * aclara el enunciado), y recién con el pedido confirmado.
 */
export function puedeAccederAJuegos(estado: EstadoPedido | null, perfil: PerfilUsuario | null): boolean {
    return perfil === 'cliente registrado' && estado !== null && ESTADOS_CONFIRMADOS.has(estado);
}

/** Punto 19: el cliente confirma la recepción recién cuando el mozo marcó la entrega. */
export function puedeConfirmarRecepcion(estado: EstadoPedido | null): boolean {
    return estado === 'Entregado';
}

/**
 * Punto 19: con el pedido recibido, el cliente accede a la encuesta y puede
 * pedir la cuenta. Una vez que la pidió, no se le vuelve a ofrecer.
 */
export function puedeUsarServiciosDeMesa(estado: EstadoPedido | null, estadoCliente: EstadoEnResto | null): boolean {
    return estado === 'Recibido' && estadoCliente !== 'pagando';
}

/**
 * Si el cliente puede armar y mandar un pedido.
 *
 * UNA VISITA, UN PEDIDO: mientras haya uno enviado, no se arma otro. El
 * cliente ve un solo pedido y una sola cuenta, y el mozo una sola comanda por
 * mesa.
 *
 * El rechazado es la excepción, y no pasa por acá: se corrige y se REENVÍA el
 * mismo pedido (`PedidoService.reenviar`), así que no es uno nuevo.
 */
export function puedeEnviarPedido(estados: readonly EstadoPedido[]): boolean {
    return estados.length === 0;
}
