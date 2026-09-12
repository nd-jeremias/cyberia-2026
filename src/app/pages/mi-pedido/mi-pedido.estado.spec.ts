import { describe, expect, it } from 'vitest';
import { EstadoPedido } from '../../interfaces/pedido.interface';
import {
    LEYENDA_PEDIDO,
    puedeAccederAJuegos,
    puedeConfirmarRecepcion,
    puedeUsarServiciosDeMesa,
} from './mi-pedido.estado';

const TODOS_LOS_ESTADOS: EstadoPedido[] = [
    'Pendiente de Confirmación',
    'Rechazado',
    'Confirmado',
    'En Preparación',
    'Listo para Entregar',
    'Entregado',
    'Recibido',
    'Pagado',
];

describe('Reglas de "Mi pedido"', () => {
    it('tiene una leyenda para cada estado del pedido', () => {
        for (const estado of TODOS_LOS_ESTADOS) {
            expect(LEYENDA_PEDIDO[estado]).toBeTruthy();
        }
    });

    describe('acceso a los juegos (punto 15)', () => {
        it.each<EstadoPedido>(['Confirmado', 'En Preparación', 'Listo para Entregar', 'Entregado', 'Recibido'])(
            'el cliente registrado accede con el pedido "%s"',
            (estado) => {
                expect(puedeAccederAJuegos(estado, 'cliente registrado')).toBe(true);
            }
        );

        // Punto 14: los juegos se habilitan recién cuando el mozo confirma.
        it.each<EstadoPedido>(['Pendiente de Confirmación', 'Rechazado', 'Pagado'])(
            'no accede con el pedido "%s"',
            (estado) => {
                expect(puedeAccederAJuegos(estado, 'cliente registrado')).toBe(false);
            }
        );

        it('el cliente anónimo no accede aunque el pedido esté confirmado', () => {
            expect(puedeAccederAJuegos('Confirmado', 'cliente anónimo')).toBe(false);
        });

        it('sin pedido no hay acceso', () => {
            expect(puedeAccederAJuegos(null, 'cliente registrado')).toBe(false);
        });
    });

    describe('confirmación de recepción (punto 19)', () => {
        it('se ofrece cuando el mozo marcó el pedido como entregado', () => {
            expect(puedeConfirmarRecepcion('Entregado')).toBe(true);
        });

        it.each(TODOS_LOS_ESTADOS.filter((estado) => estado !== 'Entregado'))(
            'no se ofrece con el pedido "%s"',
            (estado) => {
                expect(puedeConfirmarRecepcion(estado)).toBe(false);
            }
        );

        it('sin pedido no se ofrece', () => {
            expect(puedeConfirmarRecepcion(null)).toBe(false);
        });
    });

    describe('encuesta y pedido de la cuenta (punto 19)', () => {
        it('se habilitan con el pedido recibido', () => {
            expect(puedeUsarServiciosDeMesa('Recibido', 'sentado')).toBe(true);
        });

        // Hasta que confirma la recepción, el cliente no terminó de recibir su pedido.
        it.each<EstadoPedido>(['Confirmado', 'Listo para Entregar', 'Entregado'])(
            'no se habilitan con el pedido "%s"',
            (estado) => {
                expect(puedeUsarServiciosDeMesa(estado, 'sentado')).toBe(false);
            }
        );

        it('no se vuelven a ofrecer si el cliente ya pidió la cuenta', () => {
            expect(puedeUsarServiciosDeMesa('Recibido', 'pagando')).toBe(false);
        });
    });
});
