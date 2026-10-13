/**
 * Ventana entre una visita y la siguiente.
 * ============================================================================
 *
 * Cuando el mozo confirma el pago (punto 22) el cliente queda "libre", pero
 * todavía no se fue: sigue sentado a la mesa o está saliendo por la puerta. Si
 * en ese momento escanea un QR no está pidiendo una mesa nueva, y el enunciado
 * espera otra cosa: que vea las encuestas y que la mesa figure libre otra vez.
 *
 * Para distinguir "recién terminó" de "vuelve otro día" se guarda cuándo
 * terminó la visita (`usuarios.fecha_ultima_visita`) y se lo compara contra
 * una ventana. Mientras la ventana no pasa, los lectores de QR lo llevan a las
 * encuestas en lugar de volver a anotarlo o de sentarlo.
 *
 * Es una función pura a propósito: la reusan el inicio (para decidir qué
 * accesos mostrar) y los dos lectores de QR (ingreso y mesa), y recibe el
 * "ahora" por parámetro para poder probarla sin depender del reloj.
 */

/**
 * Horas que tienen que pasar para que el cliente pueda volver a anotarse.
 *
 * Cinco horas separan un turno del siguiente: quien almorzó puede volver a
 * cenar, pero quien acaba de pagar no vuelve a entrar a la lista de espera.
 */
export const HORAS_ENTRE_VISITAS = 5;

const MILISEGUNDOS_POR_HORA = 60 * 60 * 1000;

/** Fecha en la que se guarda el fin de una visita, tal como llega de la base. */
export type FechaDeVisita = string | Date | null | undefined;

/**
 * Momento a partir del cual el cliente puede volver a anotarse.
 *
 * Devuelve `null` si no hay visita registrada, o si la fecha no se puede
 * interpretar: en ambos casos no hay nada que esperar.
 */
export function fechaDeNuevaVisita(fechaUltimaVisita: FechaDeVisita, horas = HORAS_ENTRE_VISITAS): Date | null {
    if (!fechaUltimaVisita) return null;

    const fin = new Date(fechaUltimaVisita).getTime();

    if (Number.isNaN(fin)) return null;

    return new Date(fin + horas * MILISEGUNDOS_POR_HORA);
}

/**
 * Indica si la última visita terminó hace menos de la ventana.
 *
 * Es la regla del pseudocódigo: a partir de "fin de la visita + ventana" el
 * escaneo vuelve a ser un ingreso normal; antes de eso, va a las encuestas. El
 * corte es exacto: en el instante justo en que se cumple la ventana, ya puede
 * volver a ingresar.
 *
 * @param fechaUltimaVisita Cuándo terminó la última visita (`null` si nunca vino).
 * @param ahora             Instante a evaluar, en milisegundos.
 * @param horas             Largo de la ventana.
 */
export function visitaReciente(
    fechaUltimaVisita: FechaDeVisita,
    ahora: number = Date.now(),
    horas = HORAS_ENTRE_VISITAS
): boolean {
    const nuevaVisita = fechaDeNuevaVisita(fechaUltimaVisita, horas);

    if (!nuevaVisita) return false;

    return ahora < nuevaVisita.getTime();
}
