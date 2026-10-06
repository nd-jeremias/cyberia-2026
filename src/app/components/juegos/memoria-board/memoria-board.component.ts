import { Component, inject, OnInit } from '@angular/core';
import { MemoriaCardComponent } from '../memoria-card/memoria-card.component';
import { JuegosMemoriaService } from '../../../services/juegos.memoria.service';

@Component({
    selector: 'app-memoria-board',
    templateUrl: './memoria-board.component.html',
    styleUrls: ['./memoria-board.component.scss'],
    imports: [MemoriaCardComponent],
})
export class MemoriaBoardComponent implements OnInit {
    game = inject(JuegosMemoriaService);

    constructor() {}

    ngOnInit() {
        this.game.startGame();
    }
}
