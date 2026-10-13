import { Service } from '@angular/core';
import { Opcion, Pregunta } from '../interfaces/games.interface';
import { PREGUNTAS_DATA } from '../utils/preguntas';

@Service()
export class JuegosPreguntasService {
    // Aquí simulas la carga de tu archivo JSON completo (las 30 preguntas)
    private todasLasPreguntas: Pregunta[] = PREGUNTAS_DATA;

    /**
     * Obtiene una cantidad específica de preguntas aleatorias
     * con sus opciones previamente mezcladas.
     * @param cantidad Número de preguntas a retornar (por defecto 5)
     */
    obtenerPreguntasAleatorias(cantidad: number = 5): Pregunta[] {
        // 1. Clonamos el array original para no modificar la base de datos en memoria
        const preguntasClonadas = JSON.parse(JSON.stringify(this.todasLasPreguntas)) as Pregunta[];

        // 2. Mezclamos el array completo de preguntas usando Fisher-Yates
        for (let i = preguntasClonadas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [preguntasClonadas[i], preguntasClonadas[j]] = [preguntasClonadas[j], preguntasClonadas[i]];
        }

        // 3. Tomamos solo las primeras N preguntas (las 5 requeridas)
        const preguntasSeleccionadas = preguntasClonadas.slice(0, cantidad);

        // 4. Mezclamos las opciones internas de cada una de las preguntas seleccionadas
        preguntasSeleccionadas.forEach((pregunta) => {
            pregunta.opciones = this.mezclarOpciones(pregunta.opciones);
        });

        return preguntasSeleccionadas;
    }

    /**
     * Helper privado para desordenar las opciones de una pregunta
     */
    private mezclarOpciones(opciones: Opcion[]): Opcion[] {
        for (let i = opciones.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
        }
        return opciones;
    }
}
