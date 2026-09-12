import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalService } from '../../services/modal.service';
import { FormularioRegistroComponent } from './formulario-registro.component';

describe('FormularioRegistroComponent', () => {
    let fixture: ComponentFixture<FormularioRegistroComponent>;
    let componente: FormularioRegistroComponent;

    /** Deja el formulario con datos válidos para variar un campo por test. */
    function completarValido() {
        componente.formulario.setValue({
            nombres: 'Juan',
            apellidos: 'Gómez',
            dni: '12345678',
            cuil: '20123456783',
            correo: 'juan@ejemplo.com',
            tipoEmpleado: 'mozo',
            perfil: '',
            // El componente exige al menos una foto (validador minLengthArray).
            foto: [new File(['x'], 'perfil.jpg', { type: 'image/jpeg' })],
            password: 'unaClave123',
            confirmPassword: 'unaClave123',
        });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormularioRegistroComponent],
            // El template usa routerLink; sin router no se puede instanciar.
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(FormularioRegistroComponent);
        componente = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('se crea', () => {
        expect(componente).toBeTruthy();
    });

    it('arranca inválido, con todos los campos vacíos', () => {
        expect(componente.formulario.valid).toBe(false);
    });

    describe('validación de campos', () => {
        it('acepta un formulario completo y correcto', () => {
            completarValido();

            expect(componente.formulario.valid).toBe(true);
        });

        it.each([
            ['nombres', ''],
            ['apellidos', ''],
            ['correo', ''],
            ['password', ''],
        ])('exige %s', (campo, valor) => {
            completarValido();
            componente.formulario.get(campo)?.setValue(valor);

            expect(componente.formulario.valid).toBe(false);
        });

        it.each([
            ['123456', 'menos de 7 dígitos'],
            ['123456789', 'más de 8 dígitos'],
            ['1234567a', 'con letras'],
            ['12.345.678', 'con puntos'],
        ])('rechaza el DNI %s (%s)', (dni) => {
            completarValido();
            componente.formulario.get('dni')?.setValue(dni);

            expect(componente.formulario.get('dni')?.valid).toBe(false);
        });

        it.each([['1234567'], ['12345678']])('acepta el DNI %s', (dni) => {
            completarValido();
            componente.formulario.get('dni')?.setValue(dni);

            expect(componente.formulario.get('dni')?.valid).toBe(true);
        });

        it('rechaza un correo sin formato válido', () => {
            completarValido();
            componente.formulario.get('correo')?.setValue('juan-arroba-nada');

            expect(componente.formulario.get('correo')?.valid).toBe(false);
        });

        it('exige al menos 8 caracteres en la contraseña', () => {
            completarValido();
            componente.formulario.get('password')?.setValue('corta1');

            expect(componente.formulario.get('password')?.valid).toBe(false);
        });
    });

    // Este validador es de grupo, no de campo: comparar dos controles entre sí
    // no lo puede hacer un validador individual.
    describe('coincidencia de contraseñas', () => {
        it('marca el error cuando las contraseñas difieren', () => {
            completarValido();
            componente.formulario.get('confirmPassword')?.setValue('otraClave');

            expect(componente.formulario.hasError('passwordsDistintas')).toBe(
                true
            );
            expect(componente.formulario.valid).toBe(false);
        });

        it('no marca error cuando coinciden', () => {
            completarValido();

            expect(componente.formulario.hasError('passwordsDistintas')).toBe(
                false
            );
        });

        it('passwordsNoCoinciden sólo avisa si el campo fue tocado', () => {
            completarValido();
            componente.formulario.get('confirmPassword')?.setValue('otraClave');

            // Sin tocar el campo no se muestra el mensaje, para no llenar de
            // rojo un formulario que el usuario todavía no completó.
            expect(componente.passwordsNoCoinciden).toBe(false);

            componente.formulario.get('confirmPassword')?.markAsTouched();

            expect(componente.passwordsNoCoinciden).toBe(true);
        });
    });

    describe('hayError', () => {
        it('no reporta error mientras el campo no fue tocado', () => {
            expect(componente.hayError('nombres', 'required')).toBe(false);
        });

        it('reporta el error una vez tocado el campo', () => {
            componente.formulario.get('nombres')?.markAsTouched();

            expect(componente.hayError('nombres', 'required')).toBe(true);
        });

        it('devuelve false para un campo inexistente', () => {
            expect(componente.hayError('inventado', 'required')).toBe(false);
        });
    });

    // Regresión: antes el submit hacía "return" en silencio y el usuario veía
    // un botón que no respondía.
    describe('avisos al intentar enviar', () => {
        it('no emite y avisa cuando el formulario es inválido', async () => {
            const modal = TestBed.inject(ModalService);
            const espiaModal = vi.spyOn(modal, 'setOpen');
            const espiaEmit = vi.spyOn(componente.registroSubmit, 'emit');

            await componente.onRegistro();

            expect(espiaEmit).not.toHaveBeenCalled();
            expect(espiaModal).toHaveBeenCalled();
        });

        it('marca todos los campos como tocados para mostrar los mensajes', async () => {
            await componente.onRegistro();

            // Sin esto Ionic no pinta el error de los campos que el usuario
            // nunca visitó.
            expect(componente.formulario.get('nombres')?.touched).toBe(true);
            expect(componente.formulario.get('correo')?.touched).toBe(true);
        });
    });
});
