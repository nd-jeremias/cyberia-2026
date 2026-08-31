import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotificacionInterface } from '../interfaces/notificacion.interface';
import { NotificacionesService } from './notificaciones.service';

function avisoDePrueba(
    parcial: Partial<NotificacionInterface> = {}
): NotificacionInterface {
    return {
        id: 'aviso-1',
        titulo: 'Nuevo cliente pendiente',
        cuerpo: 'Gómez, Juan espera aprobación.',
        tipo: 'cliente-pendiente',
        datos: {},
        fecha: '2026-08-31T16:00:00.000Z',
        leida: false,
        ...parcial,
    };
}

describe('NotificacionesService', () => {
    let servicio: NotificacionesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        servicio = TestBed.inject(NotificacionesService);
    });

    it('se crea', () => {
        expect(servicio).toBeTruthy();
    });

    it('arranca sin token, sin permiso y sin avisos', () => {
        expect(servicio.token()).toBeNull();
        expect(servicio.permisoConcedido()).toBe(false);
        expect(servicio.notificaciones()).toEqual([]);
    });

    describe('contador de no leídas', () => {
        it('es cero cuando no hay avisos', () => {
            expect(servicio.sinLeer()).toBe(0);
        });

        it('cuenta sólo las no leídas', () => {
            servicio.notificaciones.set([
                avisoDePrueba({ id: 'a', leida: false }),
                avisoDePrueba({ id: 'b', leida: true }),
                avisoDePrueba({ id: 'c', leida: false }),
            ]);

            expect(servicio.sinLeer()).toBe(2);
        });

        it('se actualiza solo al marcar una como leída', () => {
            servicio.notificaciones.set([
                avisoDePrueba({ id: 'a' }),
                avisoDePrueba({ id: 'b' }),
            ]);

            expect(servicio.sinLeer()).toBe(2);

            servicio.marcarLeida('a');

            expect(servicio.sinLeer()).toBe(1);
        });
    });

    describe('marcarLeida', () => {
        it('marca sólo la notificación indicada', () => {
            servicio.notificaciones.set([
                avisoDePrueba({ id: 'a' }),
                avisoDePrueba({ id: 'b' }),
            ]);

            servicio.marcarLeida('a');

            const avisos = servicio.notificaciones();

            expect(avisos.find((n) => n.id === 'a')?.leida).toBe(true);
            expect(avisos.find((n) => n.id === 'b')?.leida).toBe(false);
        });

        it('no altera nada si el id no existe', () => {
            servicio.notificaciones.set([avisoDePrueba({ id: 'a' })]);

            servicio.marcarLeida('inexistente');

            expect(servicio.sinLeer()).toBe(1);
        });
    });

    describe('marcarTodasLeidas', () => {
        it('deja el contador en cero', () => {
            servicio.notificaciones.set([
                avisoDePrueba({ id: 'a' }),
                avisoDePrueba({ id: 'b' }),
                avisoDePrueba({ id: 'c' }),
            ]);

            servicio.marcarTodasLeidas();

            expect(servicio.sinLeer()).toBe(0);
            // Las notificaciones siguen en la lista, sólo cambian de estado.
            expect(servicio.notificaciones().length).toBe(3);
        });
    });

    describe('limpiar', () => {
        it('vacía la lista de avisos', async () => {
            servicio.notificaciones.set([avisoDePrueba()]);

            await servicio.limpiar();

            expect(servicio.notificaciones()).toEqual([]);
        });
    });

    // En el navegador el plugin nativo no existe. Sin esta guarda, inicializar
    // el servicio rompería `ng serve` para todo el equipo.
    describe('guarda de plataforma', () => {
        it('inicializar no lanza fuera de un dispositivo', async () => {
            await expect(servicio.inicializar()).resolves.toBeUndefined();
        });

        it('no pide permisos si no es nativo', async () => {
            await servicio.inicializar();

            expect(servicio.permisoConcedido()).toBe(false);
        });
    });
});
