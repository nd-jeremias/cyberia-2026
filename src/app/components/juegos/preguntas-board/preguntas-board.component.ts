import { Component, inject, OnInit, signal } from '@angular/core';
import { TarjetaInformacionClienteComponent } from '../../tarjeta-informacion-cliente/tarjeta-informacion-cliente.component';
import { PreguntasBotonComponent } from '../preguntas-boton/preguntas-boton.component';
import { Opcion, Pregunta } from '../../../interfaces/games.interface';
import { JuegosPreguntasService } from '../../../services/juegos.preguntas.service';
import { ModalService } from '../../../services/modal.service';
import { JuegosService } from '../../../services/juegos.service';

@Component({
    selector: 'app-preguntas-board',
    templateUrl: './preguntas-board.component.html',
    styleUrls: ['./preguntas-board.component.scss'],
    imports: [TarjetaInformacionClienteComponent, PreguntasBotonComponent],
})
export class PreguntasBoardComponent implements OnInit {
    juegosService = inject(JuegosService);
    preguntasService = inject(JuegosPreguntasService);
    modal = inject(ModalService);

    preguntasDelJuego: Pregunta[] = [];
    indiceActual: number = 0;
    preguntaActual!: Pregunta;

    // Guarda el objeto de la opción que el usuario seleccionó temporalmente
    opcionSeleccionada: Opcion | null = null;

    bloquearBotones: boolean = false;

    constructor() {}

    ngOnInit() {
        this.iniciarNuevoJuego();
    }

    iniciarNuevoJuego() {
        this.preguntasDelJuego = this.preguntasService.obtenerPreguntasAleatorias(5);
        this.indiceActual = 0;
        this.bloquearBotones = false;
        this.cargarPreguntaActual();
    }

    cargarPreguntaActual() {
        this.opcionSeleccionada = null; // Resetea la selección para la nueva pregunta
        this.bloquearBotones = false; // Desbloqueamos para la nueva pregunta
        this.preguntaActual = this.preguntasDelJuego[this.indiceActual];
    }

    // Se ejecuta cuando el usuario hace clic en uno de tus componentes botón
    seleccionarOpcion(opcion: Opcion) {
        this.opcionSeleccionada = opcion;
        this.procesarRespuesta();
    }

    // Se ejecuta al presionar tu botón "Aceptar"
    procesarRespuesta() {
        if (!this.opcionSeleccionada) return;

        // Validamos si la que seleccionó es la correcta
        if (this.opcionSeleccionada.correcta) {
            this.modal.setOpen('¡Bien hecho!', '¡Respuesta correcta!', 'info');
        } else {
            this.modal.setOpen('¡Lo siento!', '¡Respuesta incorrecta! Gracias por haber jugado', 'error');
            this.juegosService.exitGame('preguntas');
        }

        // Avanzar a la siguiente pregunta o terminar
        if (this.indiceActual < this.preguntasDelJuego.length - 1) {
            this.indiceActual++;
            this.cargarPreguntaActual();
        } else {
            this.juegosService.finalizarPorVictoria('preguntas');
        }
    }
}
