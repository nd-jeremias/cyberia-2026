import { describe, expect, it } from 'vitest';
import { HORAS_ENTRE_VISITAS, fechaDeNuevaVisita, visitaReciente } from './visita';

/**
 * Regla del fin de visita (punto 22).
 *
 * Se prueba con un "ahora" fijo: la función lo recibe por parámetro justamente
 * para no depender del reloj de la máquina que corre los tests.
 */
const FIN_DE_VISITA = '2026-09-30T20:00:00.000Z';
const FIN_MS = Date.parse(FIN_DE_VISITA);

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;

describe('Ventana entre visitas', () => {
    it('es de cinco horas, como el pseudocódigo', () => {
        expect(HORAS_ENTRE_VISITAS).toBe(5);
    });

    describe('fechaDeNuevaVisita', () => {
        it('suma la ventana al fin de la visita', () => {
            expect(fechaDeNuevaVisita(FIN_DE_VISITA)?.toISOString()).toBe('2026-10-01T01:00:00.000Z');
        });

        it('acepta la fecha como texto de la base o como Date', () => {
            expect(fechaDeNuevaVisita(new Date(FIN_MS))?.getTime()).toBe(FIN_MS + 5 * HORA);
        });

        it('respeta otra ventana si se le pasa', () => {
            expect(fechaDeNuevaVisita(FIN_DE_VISITA, 12)?.getTime()).toBe(FIN_MS + 12 * HORA);
        });

        it.each([null, undefined, ''])('devuelve null si no hay visita registrada (%s)', (fecha) => {
            expect(fechaDeNuevaVisita(fecha)).toBeNull();
        });

        it('devuelve null si la fecha no se puede interpretar', () => {
            expect(fechaDeNuevaVisita('no es una fecha')).toBeNull();
        });
    });

    describe('visitaReciente', () => {
        it('es reciente apenas termina la visita', () => {
            expect(visitaReciente(FIN_DE_VISITA, FIN_MS)).toBe(true);
        });

        it('sigue siendo reciente un minuto antes de cumplirse la ventana', () => {
            expect(visitaReciente(FIN_DE_VISITA, FIN_MS + 5 * HORA - MINUTO)).toBe(true);
        });

        // Date.now() >= fin + 5 hs: escanea ingreso. El corte es exacto.
        it('deja de serlo en el instante exacto en que se cumple la ventana', () => {
            expect(visitaReciente(FIN_DE_VISITA, FIN_MS + 5 * HORA)).toBe(false);
        });

        it('no es reciente al día siguiente', () => {
            expect(visitaReciente(FIN_DE_VISITA, FIN_MS + 24 * HORA)).toBe(false);
        });

        it('con otra ventana, corta donde corresponde', () => {
            expect(visitaReciente(FIN_DE_VISITA, FIN_MS + 6 * HORA, 12)).toBe(true);
            expect(visitaReciente(FIN_DE_VISITA, FIN_MS + 12 * HORA, 12)).toBe(false);
        });

        // Quien nunca terminó una visita, o una base sin la migración, no
        // tiene fecha: se lo trata como un ingreso normal.
        it('no es reciente si no hay fecha', () => {
            expect(visitaReciente(null, FIN_MS)).toBe(false);
        });

        it('no es reciente si la fecha no se puede interpretar', () => {
            expect(visitaReciente('no es una fecha', FIN_MS)).toBe(false);
        });

        it('usa el reloj actual si no se le pasa el instante', () => {
            const haceUnaHora = new Date(Date.now() - HORA).toISOString();
            const ayer = new Date(Date.now() - 24 * HORA).toISOString();

            expect(visitaReciente(haceUnaHora)).toBe(true);
            expect(visitaReciente(ayer)).toBe(false);
        });
    });
});
