import { computed, effect, inject, Service, signal } from '@angular/core';
import { MemoryCard } from '../interfaces/games.interface';
import { JuegosService } from './juegos.service';
import { TimerService } from './timer.service';
import { ModalService } from './modal.service';

@Service()
export class JuegosMemoriaService {
    public juegosService = inject(JuegosService);
    public timerService = inject(TimerService);
    modal = inject(ModalService);

    constructor() {
        // 💡 ESCUCHA ÚNICA: Reacciona automáticamente cuando el TimerService marca true
        effect(() => {
            if (this.timerService.terminado()) {
                this.finalizarJuegoPorTiempo();
            }
        });
    }

    // ============================================================
    // IMÁGENES DE LAS CARTAS
    // ============================================================
    backCardImg = 'assets/juegos/cartas/card_back.webp';
    frontCardImg: string[] = [
        'assets/juegos/cartas/foto1.webp',
        'assets/juegos/cartas/foto2.webp',
        'assets/juegos/cartas/foto3.webp',
        'assets/juegos/cartas/foto4.webp',
        'assets/juegos/cartas/foto5.webp',
        'assets/juegos/cartas/foto6.webp',
    ];

    // ============================================================
    // ESTADO
    // ============================================================

    /**
     * Indica si estamos esperando que termine la comprobación
     * de un par.
     *
     * Esto evita que el usuario pueda tocar una tercera carta
     * mientras se están comparando las dos anteriores.
     */
    public bloqueado = signal<boolean>(false);

    public tablero = signal<MemoryCard[]>([]);

    /**
     * Cantidad de pares encontrados.
     */
    readonly paresEncontrados = computed(() => this.tablero().filter((card) => card.estado === 'matched').length / 2);

    /**
     * Cantidad total de pares.
     */
    readonly totalPares = computed(() => this.frontCardImg.length);

    /**
     * Indica si el jugador terminó la partida.
     */
    // readonly juegoTerminado = computed(() => this.paresEncontrados() === this.totalPares());
    public juegoTerminado = signal<boolean>(false);

    public cartasSeleccionadas: number[] = [];

    startGame() {
        this.bloqueado.set(false);
        this.juegoTerminado.set(false);
        this.generarTablero();
        this.timerService.iniciar(20);
    }

    resetGame(victoria: boolean) {
        if (victoria) {
            // Cambiar estados en DB
        }
        this.juegosService.memoriaJugado.set(true);
        this.juegosService.gameState.set('RULES');
    }

    private finalizaJuego() {
        this.timerService.detener();
        this.juegoTerminado.set(true);
        this.bloqueado.set(true); // Congela el tablero para que no sigan tocando cartas
    }

    private finalizarJuegoPorTiempo() {
        this.finalizaJuego();

        // Aquí puedes disparar tu modal de derrota
        console.log('💥 ¡Se acabó el tiempo! Fin del juego.');
        this.modal.setOpen('Juego terminado!', 'Se acabo el tiempo, ¡mas suerte para la próxima!', 'info');
        this.resetGame(false);
    }

    private finalizarPorVictoria() {
        this.finalizaJuego();

        // Aquí puedes disparar tu modal de victoria
        console.log('🏆 ¡Ganaste!');
        this.modal.setOpen(
            '¡Ganaste!',
            '¡Felicidades! Completaste el juego y obtuviste un descuento. Completa los otros para acumular descuentos adicionales.',
            'info'
        );
        this.resetGame(true);
    }

    generarTablero() {
        const mazo: MemoryCard[] = [];

        // 1. Crear los 6 pares (12 cartas en total)
        this.frontCardImg.forEach((ruta, i) => {
            const idPar = i; // ID único para este par

            // Carta A
            mazo.push({ id: idPar, imagen: ruta, estado: 'default' });
            // Carta B
            mazo.push({ id: idPar, imagen: ruta, estado: 'default' });
        });

        // 2. Mezclar el mazo aleatoriamente (Fisher-Yates)
        for (let i = mazo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mazo[i], mazo[j]] = [mazo[j], mazo[i]]; // Intercambio de posiciones
        }

        // 3. Asignar el mazo mezclado al tablero listo para jugar
        this.tablero.set(mazo);
    }

    public seleccionarCarta(index: number) {
        const mazo = this.tablero();
        const carta = mazo[index];

        // VALIDACIONES DE BLOQUEO
        if (this.bloqueado() || mazo[index].estado !== 'default') return;

        // No se puede seleccionar una carta ya encontrada.
        if (!carta || carta.estado === 'matched') {
            return;
        }

        // 1. Volteamos la carta físicamente cambiando su estado en el mazo
        this.actualizarEstadoCarta(index, 'flipped');
        this.cartasSeleccionadas.push(index);

        // 2. Si ya seleccionamos 2 cartas, evaluamos el match
        if (this.cartasSeleccionadas.length === 2) {
            this.bloqueado.set(true); // Bloqueamos el tablero inmediatamente
            this.verificarMatch();
        }
    }
    encontradas: MemoryCard[] = [];
    // ============================================================
    // COMPROBAR PAR DE CARTAS SELECCIONADAS
    // ============================================================
    private verificarMatch() {
        const mazo = this.tablero();
        const [idx1, idx2] = this.cartasSeleccionadas;

        if (mazo[idx1].id === mazo[idx2].id) {
            // ✅ Hubo Coincidencia: Se quedan descubiertas
            this.actualizarEstadoCarta(idx1, 'matched');
            this.actualizarEstadoCarta(idx2, 'matched');
            this.encontradas.push(mazo[idx1], mazo[idx2]);
            this.limpiarSeleccion();
        } else {
            // ❌ Error: Esperamos 1.2 segundos para que el usuario las vea y las volvemos a ocultar
            setTimeout(() => {
                this.actualizarEstadoCarta(idx1, 'default');
                this.actualizarEstadoCarta(idx2, 'default');
                this.limpiarSeleccion();
            }, 800);
        }
        if (this.paresEncontrados() === this.totalPares()) {
            this.finalizarPorVictoria();
        }
    }

    private limpiarSeleccion() {
        this.cartasSeleccionadas = [];
        this.bloqueado.set(false); // Desbloqueamos el tablero para el siguiente turno
    }

    private actualizarEstadoCarta(index: number, nuevoEstado: 'default' | 'flipped' | 'matched') {
        this.tablero.update((mazo) =>
            mazo.map((carta, idx) => (idx === index ? { ...carta, estado: nuevoEstado } : carta))
        );
    }
}
