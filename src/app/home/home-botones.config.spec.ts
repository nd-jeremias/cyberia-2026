import { describe, expect, it } from 'vitest';
import { SituacionDelCliente, botonesDelCliente } from './home-botones.config';

/** Botones del cliente como texto, que es lo que distingue a los dos QR de mesa. */
function botones(situacion: Partial<SituacionDelCliente>): string[] {
    return botonesDelCliente({
        estado: 'libre',
        perfil: 'cliente registrado',
        estadosDePedidos: [],
        acabaDeTerminarSuVisita: false,
        ...situacion,
    }).map((boton) => boton.texto);
}

describe('Accesos del cliente en el inicio', () => {
    describe('punto 22: después de que el mozo confirma el pago', () => {
        it('recién terminada la visita, ofrece volver a escanear la mesa, el ingreso y las encuestas', () => {
            expect(botones({ estado: 'libre', acabaDeTerminarSuVisita: true })).toEqual([
                'Escanear QR de la mesa',
                'Escanear QR de ingreso',
                'Ver encuestas',
            ]);
        });

        it('pasada la ventana entre visitas, es un cliente libre más', () => {
            expect(botones({ estado: 'libre', acabaDeTerminarSuVisita: false })).toEqual([
                'Escanear QR de ingreso',
                'Ver encuestas',
            ]);
        });

        // Si ya volvió a anotarse, manda el estado y no la fecha.
        it('la visita recién terminada sólo cuenta mientras está libre', () => {
            expect(botones({ estado: 'esperando_mesa', acabaDeTerminarSuVisita: true })).toEqual(['Ver encuestas']);
        });
    });

    describe('punto 21: pedir la cuenta', () => {
        it('con el pedido recibido puede pedir la cuenta', () => {
            expect(botones({ estado: 'sentado', estadosDePedidos: ['Recibido'] })).toContain('Pedir la cuenta');
        });

        it('una vez que pagó, no se le vuelve a ofrecer', () => {
            expect(botones({ estado: 'pagando', estadosDePedidos: ['Recibido'] })).not.toContain('Pedir la cuenta');
        });
    });
});
