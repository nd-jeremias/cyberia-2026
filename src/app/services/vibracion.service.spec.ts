import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { VibracionService } from './vibracion.service';

describe('VibracionService', () => {
    let servicio: VibracionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        servicio = TestBed.inject(VibracionService);
    });

    it('se crea', () => {
        expect(servicio).toBeTruthy();
    });

    // Regresión: la vibración se llamaba antes de mostrar el modal de error.
    // En un entorno sin soporte (escritorio, jsdom) la excepción cortaba el
    // flujo y el usuario no llegaba a ver el aviso.
    describe('tolerancia a entornos sin vibración', () => {
        it('error() no lanza aunque la API no exista', async () => {
            await expect(servicio.error()).resolves.toBeUndefined();
        });

        it('exito() no lanza aunque la API no exista', async () => {
            await expect(servicio.exito()).resolves.toBeUndefined();
        });

        it('se puede invocar repetidamente sin efectos adversos', async () => {
            await servicio.error();
            await servicio.exito();
            await servicio.error();

            expect(true).toBe(true);
        });
    });
});
