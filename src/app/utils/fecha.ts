/**
 * Formato de fecha con hora, en un solo lugar.
 *
 * El punto 11 pide que cada consulta y cada respuesta muestren la fecha "con
 * hora y minutos". Mismo criterio que `formatearImporte`: si cada pantalla
 * armara su propio `toLocaleString`, la misma hora podría verse de dos formas.
 *
 * Ejemplo: "14/09 20:35".
 */
export function formatearFechaHora(fecha: string | Date): string {
    return new Date(fecha).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}
