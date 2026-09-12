import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { esTituloDeError, ModalService } from './modal.service';
import { VibracionService } from './vibracion.service';

describe('ModalService', () => {
    const vibracion = { error: vi.fn(), exito: vi.fn() };
    let modal: ModalService;

    beforeEach(() => {
        vibracion.error.mockReset();

        TestBed.configureTestingModule({
            providers: [{ provide: VibracionService, useValue: vibracion }],
        });

        modal = TestBed.inject(ModalService);
    });

    it('abre con el título y el mensaje recibidos', () => {
        modal.setOpen('Mesa asignada', 'El cliente fue asignado a la mesa 1.');

        expect(modal.isModalOpen()).toBe(true);
        expect(modal.tituloModal()).toBe('Mesa asignada');
        expect(modal.mensajeModal()).toBe('El cliente fue asignado a la mesa 1.');
    });

    it('cierra', () => {
        modal.setOpen('Aviso');
        modal.setClose();

        expect(modal.isModalOpen()).toBe(false);
    });

    // El enunciado pide vibrar ante TODOS los errores: estos son títulos que
    // hoy usa la aplicación.
    it.each([
        'Error',
        'Error al ingresar',
        'Error de registro',
        'Datos inválidos',
        'Datos incompletos',
        'Mesa ocupada',
        'Mesa inexistente',
        'Falta el cliente',
        'Faltan fotos',
        'Sesión no encontrada',
        'Código incorrecto',
        'Pedido vacío',
        'Notificaciones desactivadas',
        'Límite de imágenes alcanzado',
        'El cliente ya tiene mesa',
        'Revisar la asignación',
    ])('vibra ante el error "%s"', (titulo) => {
        modal.setOpen(titulo, 'detalle');

        expect(vibracion.error).toHaveBeenCalledTimes(1);
    });

    // Los avisos de éxito no deben vibrar: si todo vibra, la vibración deja
    // de avisar nada.
    it.each([
        'Mesa asignada',
        'Cliente aprobado',
        'Cliente rechazado',
        'Registro exitoso',
        'Producto cargado',
        'Estás en la lista',
        'Ya estabas anotado',
        'Bienvenido',
    ])('no vibra ante el aviso "%s"', (titulo) => {
        modal.setOpen(titulo, 'detalle');

        expect(vibracion.error).not.toHaveBeenCalled();
    });

    it('el tipo explícito le gana a la deducción por título', () => {
        modal.setOpen('Error', 'es sólo informativo', 'info');
        expect(vibracion.error).not.toHaveBeenCalled();

        modal.setOpen('Mesa asignada', 'pero es un error', 'error');
        expect(vibracion.error).toHaveBeenCalledTimes(1);
    });

    it('esTituloDeError no distingue mayúsculas', () => {
        expect(esTituloDeError('DATOS INVÁLIDOS')).toBe(true);
    });
});
