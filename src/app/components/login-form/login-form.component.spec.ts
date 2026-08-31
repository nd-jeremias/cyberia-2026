import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalService } from '../../services/modal.service';
import { LoginFormComponent } from './login-form.component';

describe('LoginFormComponent', () => {
    let fixture: ComponentFixture<LoginFormComponent>;
    let componente: LoginFormComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginFormComponent],
            providers: [provideRouter([])],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginFormComponent);
        componente = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('se crea', () => {
        expect(componente).toBeTruthy();
    });

    it('arranca inválido con los campos vacíos', () => {
        expect(componente.formulario.valid).toBe(false);
    });

    describe('validación', () => {
        it('acepta credenciales con formato correcto', () => {
            componente.formulario.setValue({
                email: 'mozo@restaurante.com',
                password: '12345678',
            });

            expect(componente.formulario.valid).toBe(true);
        });

        it('rechaza un correo mal formado', () => {
            componente.formulario.setValue({
                email: 'sin-arroba',
                password: '12345678',
            });

            expect(componente.formulario.get('email')?.valid).toBe(false);
        });

        it('exige al menos 8 caracteres en la contraseña', () => {
            componente.formulario.setValue({
                email: 'mozo@restaurante.com',
                password: '1234',
            });

            expect(componente.formulario.get('password')?.valid).toBe(false);
        });
    });

    describe('ingreso rápido', () => {
        it('ofrece un botón por cada perfil del enunciado', () => {
            // dueño, supervisor, metre, mozo, cocinero y cliente.
            expect(componente.usuariosValidos.length).toBeGreaterThanOrEqual(6);
        });

        it('todas las credenciales precargadas son válidas para el formulario', () => {
            for (const usuario of componente.usuariosValidos) {
                componente.cargarCredenciales(usuario.email, usuario.pass);

                expect(componente.formulario.valid).toBe(true);
            }
        });

        it('cargarCredenciales completa ambos campos', () => {
            componente.cargarCredenciales('duenio@restaurante.com', '12345678');

            expect(componente.formulario.value).toEqual({
                email: 'duenio@restaurante.com',
                password: '12345678',
            });
        });
    });

    // Regresión: este formulario arrastraba desde el inicio un submit que
    // hacía "return" en silencio y parecía un botón roto.
    describe('avisos al intentar ingresar', () => {
        it('no emite y avisa cuando los datos son inválidos', async () => {
            const modal = TestBed.inject(ModalService);
            const espiaModal = vi.spyOn(modal, 'setOpen');
            const espiaEmit = vi.spyOn(componente.loginSubmit, 'emit');

            await componente.onLogin();

            expect(espiaEmit).not.toHaveBeenCalled();
            expect(espiaModal).toHaveBeenCalled();
        });

        it('marca los campos como tocados para que se vean los mensajes', async () => {
            await componente.onLogin();

            expect(componente.formulario.get('email')?.touched).toBe(true);
            expect(componente.formulario.get('password')?.touched).toBe(true);
        });

        it('emite las credenciales cuando los datos son válidos', async () => {
            const espia = vi.spyOn(componente.loginSubmit, 'emit');

            componente.formulario.setValue({
                email: 'mozo@restaurante.com',
                password: '12345678',
            });

            await componente.onLogin();

            expect(espia).toHaveBeenCalledWith({
                email: 'mozo@restaurante.com',
                password: '12345678',
            });
        });
    });

    describe('hayError', () => {
        it('calla mientras el campo no fue tocado', () => {
            expect(componente.hayError('email', 'required')).toBe(false);
        });

        it('reporta el error una vez tocado', () => {
            componente.formulario.get('email')?.markAsTouched();

            expect(componente.hayError('email', 'required')).toBe(true);
        });
    });

    describe('ingreso anónimo', () => {
        it('emite el evento sin exigir credenciales', () => {
            const espia = vi.spyOn(componente.loginAnonimo, 'emit');

            componente.ingresoAnonimo();

            expect(espia).toHaveBeenCalled();
        });
    });
});
