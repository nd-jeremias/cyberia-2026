import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { VibracionService } from './vibracion.service';

describe('VibracionService', () => {
    let servicio: VibracionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        servicio = TestBed.inject(VibracionService);
    });

    // Regresión: la vibración se llamaba antes de abrir el modal de error, y
    // en un entorno sin soporte la excepción impedía ver el aviso.
    it('error() no lanza en un entorno sin vibración', async () => {
        await expect(servicio.error()).resolves.toBeUndefined();
    });

    it('exito() no lanza en un entorno sin vibración', async () => {
        await expect(servicio.exito()).resolves.toBeUndefined();
    });
});
