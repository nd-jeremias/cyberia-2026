import { Component, inject, OnInit } from '@angular/core';
import { JuegosMayorMenorService } from '../../../services/juegos.mayor.menor.service';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
    selector: 'app-mayor-menor-board',
    templateUrl: './mayor-menor-board.component.html',
    styleUrls: ['./mayor-menor-board.component.scss'],
    imports: [],
})
export class MayorMenorBoardComponent implements OnInit {
    mymService = inject(JuegosMayorMenorService);
    spinner = inject(SpinnerService);

    constructor() {}

    async ngOnInit() {
        this.spinner.show();
        try {
            await this.mymService.startGame();
        } catch (error) {
            console.log(error);
        } finally {
            this.spinner.hide();
        }
    }

    getCardValue(value: string): number {
        switch (value) {
            case 'ACE':
                return 14;
            case 'KING':
                return 13;
            case 'QUEEN':
                return 12;
            case 'JACK':
                return 11;
            default:
                return Number(value);
        }
    }

    async checkGuess(guess: string) {
        this.mymService.isDrawing.set(true);

        const oldValue = this.getCardValue(this.mymService.currentCard().value);
        const newValue = this.getCardValue(this.mymService.nextCard().value);

        if (oldValue === newValue) {
            this.mymService.round.set('draw');
        } else if ((guess === 'higher' && oldValue < newValue) || (guess === 'lower' && oldValue > newValue)) {
            this.mymService.round.set('win');
        } else {
            this.mymService.round.set('lose');
        }

        setTimeout(() => {
            this.mymService.onContinue();
        }, 800);
    }
}
