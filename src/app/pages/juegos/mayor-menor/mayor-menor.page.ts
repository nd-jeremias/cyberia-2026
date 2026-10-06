import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { HeaderComponent } from '../../../components/header/header.component';
import { TarjetaInformacionClienteComponent } from '../../../components/tarjeta-informacion-cliente/tarjeta-informacion-cliente.component';
import { JuegosService } from '../../../services/juegos.service';
import { Router } from '@angular/router';
import { MayorMenorBoardComponent } from '../../../components/juegos/mayor-menor-board/mayor-menor-board.component';

@Component({
    selector: 'app-mayor-menor',
    templateUrl: './mayor-menor.page.html',
    styleUrls: ['./mayor-menor.page.scss'],
    imports: [
        IonContent,
        CommonModule,
        FormsModule,
        FaIconComponent,
        HeaderComponent,
        TarjetaInformacionClienteComponent,
        MayorMenorBoardComponent,
    ],
})
export class MayorMenorPage implements OnInit {
    game = inject(JuegosService);
    router = inject(Router);

    public textoInformativo = computed(() => {
        return this.game.juegosEstado.mayormenor()
            ? 'Bienvenido de vuelta. Hacierta las 5 rondas adivinando el valor de la carta siguiente para ganar. En esta ocasión ya no será aplicable el descuento.'
            : 'Adivina si la carta que sigue es mas grande o mas chica que la actual durante 5 rondas para ganar y sumar descuentos a tu pedido. ';
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
