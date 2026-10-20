import { Component, inject, OnInit, signal } from '@angular/core';
import { PreguntasBotonComponent } from '../preguntas-boton/preguntas-boton.component';
import { Opcion, Pregunta } from '../../../interfaces/games.interface';
import { JuegosPreguntasService } from '../../../services/juegos.preguntas.service';
import { ModalService } from '../../../services/modal.service';
import { JuegosService } from '../../../services/juegos.service';

@Component({
    selector: 'app-preguntas-board',
    templateUrl: './preguntas-board.component.html',
    styleUrls: ['./preguntas-board.component.scss'],
    imports: [PreguntasBotonComponent],
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

        // 1. Validar si la respuesta es incorrecta
        if (!this.opcionSeleccionada.correcta) {
            this.modal.setOpen('¡Lo siento!', '¡Respuesta incorrecta! Gracias por haber jugado', 'error');
            this.juegosService.exitGame('preguntas');
            return; // Cortamos la ejecución aquí si pierde
        }

        // 2. Si llegó aquí, la respuesta es CORRECTA. Evaluamos si hay más preguntas o si ganó.
        if (this.indiceActual < this.preguntasDelJuego.length - 1) {
            // Aún quedan preguntas, mostramos éxito y avanzamos
            this.modal.setOpen('¡Bien hecho!', '¡Respuesta correcta!', 'info');
            this.indiceActual++;
            this.cargarPreguntaActual();
        } else {
            // Era la última pregunta y contestó bien ¡Ganó el juego!
            this.juegosService.finalizarPorVictoria('preguntas');
        }
    }
}
