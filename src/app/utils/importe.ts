/**
 * Formato de dinero, en un solo lugar.
 *
 * Los importes se muestran en la carta, en el resumen del pedido, en la
 * pantalla del mozo y en cada tarjeta de producto. Antes cada una repetía las
 * mismas cinco opciones de `toLocaleString`, con el riesgo de que alguna
 * quedara distinta y el mismo precio se viera de dos formas según la pantalla.
 *
 * Sin centavos a propósito: los precios del local son redondos y el enunciado
 * pide que el total se lea grande y claro.
 */
export function formatearImporte(importe: number): string {
    return importe.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}
