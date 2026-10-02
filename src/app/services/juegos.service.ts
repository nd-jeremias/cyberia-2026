import { Service, signal } from '@angular/core';

@Service()
export class JuegosService {
    public gameState = signal<'RULES' | 'PLAYING' | 'RESULT'>('RULES');

    public memoriaJugado = signal<boolean>(false);
    public preguntasJugado = signal<boolean>(false);
    public Jugado = signal<boolean>(false);
}
