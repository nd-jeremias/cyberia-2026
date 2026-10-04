import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../../components/header/header.component';
import { TarjetaInformacionClienteComponent } from '../../../components/tarjeta-informacion-cliente/tarjeta-informacion-cliente.component';
import { JuegosService } from '../../../services/juegos.service';
import { Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { PreguntasBoardComponent } from '../../../components/juegos/preguntas-board/preguntas-board.component';
import { JuegosPreguntasService } from '../../../services/juegos.preguntas.service';

@Component({
    selector: 'app-preguntas',
    templateUrl: './preguntas.page.html',
    styleUrls: ['./preguntas.page.scss'],
    imports: [
        FaIconComponent,
        IonContent,
        HeaderComponent,
        CommonModule,
        FormsModule,
        TarjetaInformacionClienteComponent,
        PreguntasBoardComponent,
    ],
})
export class PreguntasPage implements OnInit {
    game = inject(JuegosService);
    router = inject(Router);
    preguntas = inject(JuegosPreguntasService);

    public textoInformativo = computed(() => {
        return this.game.juegosEstado.preguntas()
            ? 'Bienvenido de vuelta. Responde todas las preguntas en el tiempo establecido para ganar. En esta ocasión ya no será aplicable el descuento.'
            : 'Responde todas las preguntas en el tiempo establecido para ganar y sumar descuentos a tu pedido. ';
    });

    constructor() {}

    ngOnInit() {}

    ionViewWillLeave() {
        this.game.exitGame('preguntas');
    }

    cancelarIntento() {
        this.router.navigate(['/juegos']);
    }
}
