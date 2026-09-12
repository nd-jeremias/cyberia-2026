import { PerfilUsuario } from '../../interfaces/auth.interface';
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
    Rechazado: 'El mozo pidió cambios en tu pedido. Consultalo con él para corregirlo.',
    Confirmado: 'El mozo confirmó tu pedido y ya pasó a cocina y barra.',
    'En Preparación': 'Tu pedido se está preparando.',
    'Listo para Entregar': 'Tu pedido está listo. El mozo te lo lleva enseguida.',
    Entregado: 'Tu pedido ya está en la mesa. ¡Buen provecho!',
    Pagado: 'Tu cuenta ya fue pagada. ¡Gracias por venir!',
};

/**
 * Estados desde los que el cliente ya puede entrar a los juegos: el punto 14
 * los habilita recién cuando el mozo confirma el pedido.
 */
const ESTADOS_CON_JUEGOS: ReadonlySet<EstadoPedido> = new Set<EstadoPedido>([
    'Confirmado',
    'En Preparación',
    'Listo para Entregar',
    'Entregado',
]);

/**
 * Punto 15: sólo el cliente registrado juega por descuentos (el anónimo no, lo
 * aclara el enunciado), y recién con el pedido confirmado.
 */
export function puedeAccederAJuegos(estado: EstadoPedido | null, perfil: PerfilUsuario | null): boolean {
    return perfil === 'cliente registrado' && estado !== null && ESTADOS_CON_JUEGOS.has(estado);
}
