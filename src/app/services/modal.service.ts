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

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    private vibracion = inject(VibracionService);

    isModalOpen = signal<boolean>(false);
    tituloModal = signal<string>('¡Atención!');
    mensajeModal = signal<string | null>(null);

    setOpen(titulo?: string, mensaje?: string, tipo?: TipoModal) {
        this.isModalOpen.set(true);

        this.mensajeModal.set(mensaje ?? null);

        this.tituloModal.set(titulo ?? '¡Atención!');

        const esError = tipo ? tipo === 'error' : esTituloDeError(titulo ?? '');

        if (esError) void this.vibracion.error();
    }

    setClose() {
        this.isModalOpen.set(false);
    }
}
