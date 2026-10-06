import { Component, inject, input, OnInit, output } from '@angular/core';
import { JuegosMemoriaService } from '../../../services/juegos.memoria.service';
import { MemoryCard } from '../../../interfaces/games.interface';

@Component({
    selector: 'app-memoria-card',
    templateUrl: './memoria-card.component.html',
    styleUrls: ['./memoria-card.component.scss'],
    imports: [],
})
export class MemoriaCardComponent implements OnInit {
    cartaData = input.required<MemoryCard>();
    cardClick = output<void>(); // No necesita mandar el index, el padre ya lo sabe en el @for

    constructor() {}

    ngOnInit() {}

    alHacerClic() {
        // La carta solo avisa que la tocaron si estaba oculta
        if (this.cartaData().estado === 'default') {
            this.cardClick.emit();
        }
    }
}
