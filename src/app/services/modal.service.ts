import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    
    isModalOpen = signal<boolean>(false);
    tituloModal = signal<string>('¡Atención!');
    mensajeModal = signal<string | null>(null);

    setOpen(titulo?: string, mensaje?: string) {
        this.isModalOpen.set(true)

        this.mensajeModal.set(mensaje ?? null);

        this.tituloModal.set(titulo ?? '¡Atención!');
    }

    setClose(){
        this.isModalOpen.set(false)
    }
}
