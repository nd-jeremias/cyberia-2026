import { Router } from '@angular/router';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
        MemoriaBoardComponent,
    ],
})
export class MemoriaPage implements OnInit {
    game = inject(JuegosService);
    memoria = inject(JuegosMemoriaService);
    router = inject(Router);

    public textoInformativo = computed(() => {
        return this.game.juegosEstado.memoria()
            ? 'Bienvenido de vuelta. Encontrá la pareja de cartas iguales antes que se termine el tiempo. En esta ocasión ya no será aplicable el descuento.'
            : 'Encontrá la pareja de cartas iguales antes que se termine el tiempo y accedé al descuento.';
    });

    constructor() {}

    ngOnInit() {}

    ionViewWillLeave() {
        this.memoria.exitGame();
    }

    cancelarIntento() {
        this.router.navigate(['/juegos']);
    }
}
