import { inject, Injectable, signal } from '@angular/core';
import { VibracionService } from './vibracion.service';

/** Si el modal comunica un error (vibra) o un aviso común (no vibra). */
export type TipoModal = 'error' | 'info';

/**
 * Fragmentos que delatan un título de error.
 *
 * El enunciado exige vibrar ante TODOS los errores, y hay decenas de lugares
 * que abren este modal. En vez de agregar la vibración uno por uno (y olvidar
 * alguno), el modal la decide solo a partir del título. Quien necesite forzar
 * el comportamiento puede pasar el tipo de forma explícita.
 */
const PATRON_TITULO_ERROR =
    /^error|inv[aá]lid|incomplet|incorrect|ocupad|falta|inexistent|vac[ií]o|desactivad|l[ií]mite|no encontrad|ya tiene|revisar/i;

export function esTituloDeError(titulo: string): boolean {
    return PATRON_TITULO_ERROR.test(titulo);
}

export interface ModalOption {
    texto: string;
    icono?: string;
    value: any; // El valor real que vas a guardar (ej. el objeto mesa o string)
}

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    private vibracion = inject(VibracionService);

    isModalOpen = signal<boolean>(false);
    tituloModal = signal<string>('¡Atención!');
    mensajeModal = signal<string | null>(null);

    /* SIGNALS PARA EL SELECTOR */
    modalSelect = signal<boolean>(false);
    options = signal<ModalOption[]>([]);

    // Almacenamos la función que resuelve la promesa de selección
    private resolveSeleccion: ((value: any) => void) | null = null;

    setOpen(titulo?: string, mensaje?: string, tipo?: TipoModal) {
        this.modalSelect.set(false); // No es un select
        this.options.set([]);

        this.isModalOpen.set(true);

        this.mensajeModal.set(mensaje ?? null);

        this.tituloModal.set(titulo ?? '¡Atención!');

        const esError = tipo ? tipo === 'error' : esTituloDeError(titulo ?? '');

        if (esError) void this.vibracion.error();
    }

    setOpenSelect(titulo: string, opciones: ModalOption[]): Promise<any> {
        this.modalSelect.set(true); // Activa el modo select
        this.options.set(opciones);
        this.tituloModal.set(titulo);
        this.mensajeModal.set(null);
        this.isModalOpen.set(true);

        // Retornamos una promesa que quedará pausada hasta que se llame a resolverSeleccion
        return new Promise((resolve) => {
            this.resolveSeleccion = resolve;
        });
    }

    /**
     * Emite el valor seleccionado al flujo que abrió el modal
     */
    notificarSeleccion(valor: any) {
        if (this.resolveSeleccion) {
            this.resolveSeleccion(valor); // Resuelve la promesa devolviendo el valor
            this.resolveSeleccion = null; // Limpia la referencia
        }
        this.setClose();
    }

    setClose() {
        this.isModalOpen.set(false);
        // Si el usuario cierra el modal sin elegir nada, resolvemos con null
        if (this.resolveSeleccion) {
            this.resolveSeleccion(null);
            this.resolveSeleccion = null;
        }
    }
}
