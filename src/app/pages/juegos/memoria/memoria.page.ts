import { Router } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../../components/header/header.component';
import { JuegosMemoriaService } from '../../../services/juegos.memoria.service';
import { JuegosService } from '../../../services/juegos.service';
import { TarjetaInformacionClienteComponent } from '../../../components/tarjeta-informacion-cliente/tarjeta-informacion-cliente.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MemoriaBoardComponent } from '../../../components/juegos/memoria-board/memoria-board.component';

@Component({
    selector: 'app-memoria',
    templateUrl: './memoria.page.html',
    styleUrls: ['./memoria.page.scss'],
    imports: [
        IonContent,
        HeaderComponent,
        CommonModule,
        FormsModule,
        TarjetaInformacionClienteComponent,
        FaIconComponent,
        MemoriaBoardComponent
    ],
})
export class MemoriaPage implements OnInit {
    game = inject(JuegosService);
    memoria = inject(JuegosMemoriaService);
    routes = inject(Router);

    textoInformativo = this.game.memoriaJugado()
        ? 'Bienvenido de vuelta. Encontrá la pareja de cartas iguales antes que se termine el tiempo. En esta ocación ya no será aplicable el descuento. '
        : 'Encontrá la pareja de cartas iguales antes que se termine el tiempo y accedé al descuento.';

    constructor() {}

    ngOnInit() {}

    ionViewWillLeave(){
        this.cancelarIntento();
    }

    cancelarIntento() {
        this.game.gameState.set('RULES');
        this.game.memoriaJugado.set(true);
        this.routes.navigate(['/juegos']);
    }
}
