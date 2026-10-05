import { inject, Service, signal } from '@angular/core';
import { SpinnerService } from './spinner.service';
import { JuegosService } from './juegos.service';
import { ModalService } from './modal.service';

@Service()
export class JuegosMayorMenorService {
    spinner = inject(SpinnerService);
    juegos = inject(JuegosService);
    modal = inject(ModalService);

    public currentCard = signal<any>(null);
    public isDrawing = signal(false);
    public nextCard = signal<any>(null);

    private total_rondas = 5;
    private ronda_actual = 1;

    private deck_count = 1;
    public round = signal<'win' | 'lose' | 'draw' | null>(null);
    public deck_id = signal<string>('');

    backCardImg = 'assets/juegos/cartas/card_back.webp';
    API_URL = `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${this.deck_count}`;
    CARD_URL = `https://deckofcardsapi.com/api/deck/deck_id/draw/`;

    async getDeck() {
        try {
            const response = await fetch(this.API_URL);
            if (!response.ok) throw new Error();

            const data = await response.json();

            return data;
        } catch (error) {
            console.log(error);
        }
    }

    async startGame() {
        const deck = await this.getDeck();
        this.deck_id.set(deck.deck_id);
        await this.drawCard().then((cards) => this.currentCard.set(cards.cards[0]));
        await this.drawCard().then((cards) => this.nextCard.set(cards.cards[0]));
        this.ronda_actual = 1;
    }

    async drawCard() {
        try {
            const url = this.CARD_URL.replace('deck_id', this.deck_id);
            const response = await fetch(url);
            if (!response.ok) throw new Error();

            const data = await response.json();
            return data;
        } catch (error) {
            console.log(error);
        }
    }

    async onContinue() {
        if (this.round() == 'lose') {
            this.modal.setOpen(
                'Partida finalizada',
                'No has adivinado el valor que seguía. Vuelve a intentarlo nuevamente.'
            );
            this.juegos.exitGame('mayormenor');
            return
        }
        if (this.ronda_actual < this.total_rondas) {
            this.ronda_actual += 1;
            this.isDrawing.set(false);
            this.currentCard.set(this.nextCard());
            const cards = await this.drawCard();
            this.nextCard.set(cards.cards[0]);
        } else {
            this.juegos.finalizarPorVictoria('mayormenor');
        }
    }
}
