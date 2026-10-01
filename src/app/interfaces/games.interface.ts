export interface GamesInterface {}

export type CardState = 'default' | 'flipped' | 'matched';

export interface MemoryCard {
  id: number;
  imagen: string;
  estado: CardState;
}