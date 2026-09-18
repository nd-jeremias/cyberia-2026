import { Component, ElementRef, computed, effect, input, output, signal, viewChild } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { MensajeInterface } from '../../interfaces/conversacion.interface';
import { formatearFechaHora } from '../../utils/fecha';

/** Largo máximo de un mensaje: una consulta, no una carta. */
export const LARGO_MAXIMO_MENSAJE = 200;

/**
 * Conversación estilo WhatsApp (punto 11).
 *
 * La usan las dos puntas: el cliente desde su mesa y el mozo desde el listado
 * de consultas. El componente sólo dibuja y valida; guardar el mensaje lo
 * resuelve la pantalla con lo que emite `enviar`.
 *
 *   - Los mensajes propios van a la derecha y en naranja; los del otro, a la
 *     izquierda y en papel.
 *   - Debajo de cada mensaje va quién y cuándo: "Mesa 4 · 14/09 20:35" si lo
 *     escribió el cliente, "Martín · 14/09 20:37" si respondió un mozo. Es lo
 *     que el enunciado pide ver en la consulta y en la respuesta.
 *
 * Ocupa todo el alto disponible: la lista de mensajes se desplaza y la caja de
 * texto queda siempre abajo, pegada al teclado.
 */
@Component({
    selector: 'app-sala-conversacion',
    templateUrl: './sala-conversacion.component.html',
    styleUrls: ['./sala-conversacion.component.scss'],
    imports: [IonIcon],
})
export class SalaConversacionComponent {
    mensajes = input<MensajeInterface[]>([]);

    /** Quién está usando la app: define qué burbujas van a la derecha. */
    usuarioId = input<string | null>(null);

    /** Dueño del chat: sus mensajes se firman con la mesa, no con el nombre. */
    clienteId = input<string | null>(null);
    numeroMesa = input<number | null>(null);

    enviando = input(false);

    /** Consultas rápidas para arrancar la conversación con un toque. */
    sugerencias = input<string[]>([]);

    textoVacio = input('Todavía no hay mensajes.');

    enviar = output<string>();

    readonly largoMaximo = LARGO_MAXIMO_MENSAJE;

    texto = signal('');

    private textoLimpio = computed(() => this.texto().trim());

    puedeEnviar = computed(
        () => !this.enviando() && this.textoLimpio().length > 0 && this.textoLimpio().length <= this.largoMaximo
    );

    private lista = viewChild<ElementRef<HTMLElement>>('lista');

    constructor() {
        // Como en cualquier chat: al llegar un mensaje se baja hasta el final.
        // Se espera un ciclo para que la burbuja nueva ya esté dibujada.
        effect(() => {
            this.mensajes();

            setTimeout(() => {
                const lista = this.lista()?.nativeElement;
                if (lista) lista.scrollTop = lista.scrollHeight;
            });
        });
    }

    esPropio(mensaje: MensajeInterface): boolean {
        return mensaje.autorId === this.usuarioId();
    }

    firma(mensaje: MensajeInterface): string {
        const autor =
            mensaje.autorId === this.clienteId() ? `Mesa ${this.numeroMesa() ?? '?'}` : mensaje.nombreAutor;

        return `${autor} · ${formatearFechaHora(mensaje.fecha)}`;
    }

    alEscribir(evento: Event) {
        this.texto.set((evento.target as HTMLInputElement).value);
    }

    mandar() {
        if (!this.puedeEnviar()) return;

        this.enviar.emit(this.textoLimpio());
        this.texto.set('');
    }

    usarSugerencia(sugerencia: string) {
        if (this.enviando()) return;

        this.enviar.emit(sugerencia);
    }
}
