/**
 * Contenido de los códigos QR de la aplicación.
 *
 * Todos los QR llevan adentro un JSON con un campo `tipo` que dice qué son.
 * Ese discriminante es lo que permite tener un solo lector: se escanea, se
 * mira el `tipo` y recién ahí se sabe qué hacer, en lugar de adivinar por el
 * formato o por la pantalla desde la que se escaneó.
 *
 * Regla general: dentro del QR va **sólo un identificador**, nunca datos que
 * puedan cambiar. Un QR impreso y pegado en una mesa vive meses; si adentro
 * viajaran el tipo de mesa o la cantidad de lugares, al editar la mesa el
 * papel quedaría mintiendo.
 */

/** QR de ingreso al local: uno solo para todo el restaurante (punto 9). */
export interface QrIngresoLocal {
    tipo: 'ingreso-local';
}

/** QR pegado en cada mesa (puntos 10 y 11). */
export interface QrMesa {
    tipo: 'mesa';
    /** `mesas.id`. Lo único que hace falta: el resto se busca en la base. */
    id: string;
}

/** QR de propina, uno por nivel de satisfacción (punto 21). */
export interface QrPropina {
    tipo: 'propina';
    /** Porcentaje que se suma a la cuenta: 20, 15, 10, 5 o 0. */
    porcentaje: number;
}

export type QrPayload = QrIngresoLocal | QrMesa | QrPropina;
