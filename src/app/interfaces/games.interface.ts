export interface GamesInterface {}

export type CardState = 'default' | 'flipped' | 'matched';

export interface MemoryCard {
    id: number;
    imagen: string;
    estado: CardState;
}

export interface Opcion {
    texto: string;
    correcta: boolean;
}

export interface Pregunta {
    id: number;
    pregunta: string;
    opciones: Opcion[];
}
