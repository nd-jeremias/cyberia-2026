import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ModalService {

    isModalOpen = false;

    tituloModal = signal<string>("¡Atención!")
    mensajeModal = signal<string | null>(null)

    setOpen(isOpen: boolean, titulo?: string, mensaje?: string) {
        this.isModalOpen = isOpen;

        this.mensajeModal.set(mensaje ?? null)

        this.tituloModal.set(titulo ?? "¡Atención!")
    }

}
