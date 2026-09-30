import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { TarjetaUsuarioComponent } from './tarjeta-usuario.component';

function usuarioDePrueba(
    parcial: Partial<ClienteInterface> = {}
): ClienteInterface {
    return {
        id: 'cliente-1',
        nombres: 'Juan',
        apellidos: 'Gómez',
        dni: '12345678',
        correo_electronico: 'juan@ejemplo.com',
        // `foto_url` pasó a ser una lista: la interfaz ClienteInterface admite
        // varias fotos por usuario.
        foto_url: ['https://ejemplo/foto.jpg'],
        estado: 'Pendiente',
        fecha_registro: '2026-08-31T15:30:00.000Z',
        ...parcial,
    };
}

describe('TarjetaUsuarioComponent', () => {
    let fixture: ComponentFixture<TarjetaUsuarioComponent>;
    let componente: TarjetaUsuarioComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TarjetaUsuarioComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TarjetaUsuarioComponent);
        componente = fixture.componentInstance;

        fixture.componentRef.setInput('usuario', usuarioDePrueba());
        fixture.detectChanges();
    });

    it('se crea', () => {
        expect(componente).toBeTruthy();
    });

    describe('nombreCompleto', () => {
        it('arma "Apellidos, Nombres"', () => {
            expect(componente.nombreCompleto()).toBe('Gómez, Juan');
        });

        it('se recalcula al cambiar el usuario', () => {
            fixture.componentRef.setInput(
                'usuario',
                usuarioDePrueba({ nombres: 'Ana', apellidos: 'Pérez' })
            );
            fixture.detectChanges();

            expect(componente.nombreCompleto()).toBe('Pérez, Ana');
        });
    });

    describe('colorEstado', () => {
        it.each([
            ['Activo', 'success'],
            ['Rechazado', 'danger'],
            ['Pendiente', 'warning'],
        ] as const)('para %s usa el color %s', (estado, esperado) => {
            fixture.componentRef.setInput('usuario', usuarioDePrueba({ estado }));
            fixture.detectChanges();

            expect(componente.colorEstado()).toBe(esperado);
        });
    });

    describe('fechaFormateada', () => {
        it('devuelve una fecha legible en formato local', () => {
            const formateada = componente.fechaFormateada();

            // Formato es-AR: día/mes/año más hora y minutos.
            expect(formateada).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        });
    });

    // Los botones son <button> propios con íconos de FontAwesome: la tarjeta
    // dejó de usar ion-button e Ionicons.
    describe('acciones', () => {
        it('no muestra botones si no se le pasan acciones', () => {
            const botones = fixture.nativeElement.querySelectorAll('.acciones button');

            expect(botones.length).toBe(0);
        });

        it('renderiza un botón por cada acción recibida', () => {
            fixture.componentRef.setInput('acciones', [
                {
                    id: 'aprobar',
                    etiqueta: 'Aprobar',
                    icono: 'circle-check',
                    color: 'success',
                },
                {
                    id: 'rechazar',
                    etiqueta: 'Rechazar',
                    icono: 'circle-xmark',
                    color: 'danger',
                },
            ]);
            fixture.detectChanges();

            const botones = fixture.nativeElement.querySelectorAll('.acciones button');

            expect(botones.length).toBe(2);
            expect(botones[0].textContent).toContain('Aprobar');
            expect(botones[1].textContent).toContain('Rechazar');
        });

        it('emite la acción junto con el usuario al que corresponde', () => {
            const espia = vi.spyOn(componente.accionSeleccionada, 'emit');

            componente.onAccion('aprobar');

            expect(espia).toHaveBeenCalledWith({
                accion: 'aprobar',
                usuario: expect.objectContaining({ id: 'cliente-1' }),
            });
        });
    });

    // La tarjeta se reutiliza en pantallas que muestran distinta información:
    // el listado de pendientes muestra el contacto, la del metre no.
    describe('datos opcionales', () => {
        // El bloque de contacto muestra el DNI y la fecha de la solicitud; el
        // correo quedó fuera de la tarjeta.
        it('muestra el contacto por defecto', () => {
            const texto = fixture.nativeElement.textContent as string;

            expect(texto).toContain('DNI: 12345678');
        });

        it('oculta el contacto cuando se lo desactiva', () => {
            fixture.componentRef.setInput('mostrarContacto', false);
            fixture.detectChanges();

            const texto = fixture.nativeElement.textContent as string;

            expect(texto).not.toContain('12345678');
        });

        it('muestra el estado sólo si se lo pide', () => {
            expect(
                fixture.nativeElement.querySelector('ion-badge')
            ).toBeNull();

            fixture.componentRef.setInput('mostrarEstado', true);
            fixture.detectChanges();

            expect(
                fixture.nativeElement.querySelector('ion-badge')
            ).not.toBeNull();
        });
    });

    describe('foto', () => {
        it('muestra la imagen cuando el usuario tiene foto', () => {
            const img = fixture.nativeElement.querySelector('img.foto-usuario');

            expect(img).not.toBeNull();
            expect(img.getAttribute('src')).toBe('https://ejemplo/foto.jpg');
        });

        it('muestra un ícono de reemplazo si no hay foto', () => {
            fixture.componentRef.setInput(
                'usuario',
                usuarioDePrueba({ foto_url: null })
            );
            fixture.detectChanges();

            expect(
                fixture.nativeElement.querySelector('img.foto-usuario')
            ).toBeNull();
            expect(
                fixture.nativeElement.querySelector('.foto-ausente')
            ).not.toBeNull();
        });
    });
});
