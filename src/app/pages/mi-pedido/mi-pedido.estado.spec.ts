import { describe, expect, it } from 'vitest';
import { EstadoPedido } from '../../interfaces/pedido.interface';
import { LEYENDA_PEDIDO, puedeAccederAJuegos } from './mi-pedido.estado';

const TODOS_LOS_ESTADOS: EstadoPedido[] = [
    'Pendiente de Confirmación',
    'Rechazado',
    'Confirmado',
    'En Preparación',
    'Listo para Entregar',
    'Entregado',
    'Pagado',
];

describe('Reglas de "Mi pedido"', () => {
    it('tiene una leyenda para cada estado del pedido', () => {
        for (const estado of TODOS_LOS_ESTADOS) {
            expect(LEYENDA_PEDIDO[estado]).toBeTruthy();
        }
    });

    describe('acceso a los juegos (punto 15)', () => {
        it.each<EstadoPedido>(['Confirmado', 'En Preparación', 'Listo para Entregar', 'Entregado'])(
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
});
