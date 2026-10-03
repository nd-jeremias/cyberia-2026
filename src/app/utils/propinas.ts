/**
 * Niveles de propina del enunciado (puntos 5 y 21).
 *
 * El cliente no elige un porcentaje de una lista: escanea el QR del nivel de
 * satisfacción que le corresponde a su experiencia, y ese nivel define cuánto
 * se le suma a la cuenta. Por eso los cinco niveles viven en un solo lugar: los
 * usa la pantalla que genera los QR (la del mozo) y cualquier pantalla que
 * tenga que nombrar la propina ya cargada.
 *
 * Los porcentajes son los del enunciado y no se tocan.
 */
export interface NivelPropina {
    /** Cómo se llama el nivel en el enunciado. */
    etiqueta: string;
    /** Lo que se suma a la cuenta. */
    porcentaje: number;
    /** Icono de Font Awesome (estilo sólido). */
    icono: string;
}

export const NIVELES_PROPINA: readonly NivelPropina[] = [
    { etiqueta: 'Excelente', porcentaje: 20, icono: 'face-grin-stars' },
    { etiqueta: 'Muy bueno', porcentaje: 15, icono: 'face-smile' },
    { etiqueta: 'Bueno', porcentaje: 10, icono: 'thumbs-up' },
    { etiqueta: 'Regular', porcentaje: 5, icono: 'face-meh' },
    { etiqueta: 'Malo', porcentaje: 0, icono: 'face-frown' },
];

/** El nombre del nivel, para mostrar la propina que el cliente ya eligió. */
export function nivelDePropina(porcentaje: number): NivelPropina | null {
    return NIVELES_PROPINA.find((nivel) => nivel.porcentaje === porcentaje) ?? null;
}
