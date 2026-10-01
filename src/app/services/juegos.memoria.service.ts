import { Service, signal } from '@angular/core';
import { MemoryCard } from '../interfaces/games.interface';

@Service()
export class JuegosMemoriaService {
    backCardImg = 'assets/games/memory/card_back.jpeg';
    frontCardImg: string[] = [
        'assets/games/memory/foto1.png',
        'assets/games/memory/foto2.png',
        'assets/games/memory/foto3.png',
        'assets/games/memory/foto4.png',
        'assets/games/memory/foto5.png',
        'assets/games/memory/foto6.png',
    ];

    public bloqueado = signal<boolean>(false);
    public tablero = signal<MemoryCard[]>([]);

    public cartasSeleccionadas: number[] = [];

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

        // 🛑 VALIDACIONES DE BLOQUEO
        if (this.bloqueado() || mazo[index].estado !== 'default') return;

        // 1. Volteamos la carta físicamente cambiando su estado en el mazo
        this.actualizarEstadoCarta(index, 'flipped');
        this.cartasSeleccionadas.push(index);

        // 2. Si ya seleccionamos 2 cartas, evaluamos el match
        if (this.cartasSeleccionadas.length === 2) {
            this.bloqueado.set(true); // Bloqueamos el tablero inmediatamente
            this.verificarMatch();
        }
    }

    private verificarMatch() {
        const mazo = this.tablero();
        const [idx1, idx2] = this.cartasSeleccionadas;
        console.log('VERIFICANDO: ');
        if (mazo[idx1].id === mazo[idx2].id) {
            console.log('HAY MATCH');
            // ✅ Hubo Coincidencia: Se quedan descubiertas
            this.actualizarEstadoCarta(idx1, 'matched');
            this.actualizarEstadoCarta(idx2, 'matched');
            this.limpiarSeleccion();
        } else {
            console.log('NO HAY MATCH');
            // ❌ Error: Esperamos 1.2 segundos para que el usuario las vea y las volvemos a ocultar
            setTimeout(() => {
                this.actualizarEstadoCarta(idx1, 'default');
                this.actualizarEstadoCarta(idx2, 'default');
                this.limpiarSeleccion();
            }, 800);
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
