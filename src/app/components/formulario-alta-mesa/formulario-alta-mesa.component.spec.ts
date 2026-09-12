import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalService } from '../../services/modal.service';
import { FormularioAltaMesaComponent } from './formulario-alta-mesa.component';

describe('FormularioAltaMesaComponent', () => {
    let fixture: ComponentFixture<FormularioAltaMesaComponent>;
    let componente: FormularioAltaMesaComponent;
    let modal: ModalService;

    /** Completa los datos de la mesa, sin foto. */
    function completarDatos() {
        componente.formulario.patchValue({ numeroMesa: 5, cantidadLugares: 4, tipo: 'VIP' });
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormularioAltaMesaComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FormularioAltaMesaComponent);
        componente = fixture.componentInstance;
        modal = TestBed.inject(ModalService);
        fixture.detectChanges();
    });

    it('se crea', () => {
        expect(componente).toBeTruthy();
    });

    it('sin datos ni foto, no emite y pide revisar los campos y cargar la foto', async () => {
        const espiaModal = vi.spyOn(modal, 'setOpen');
        const espiaEmit = vi.spyOn(componente.mesaSubmit, 'emit');

        await componente.onAltaMesa();

        expect(espiaEmit).not.toHaveBeenCalled();
        expect(espiaModal).toHaveBeenCalledWith(
            'Datos inválidos',
            'Revise los campos marcados y cargue la foto de la mesa.'
        );
    });

    // Regresión: se preguntaba `!this.fotos`, que con un arreglo vacío nunca es
    // verdadero, y el aviso de la foto no aparecía jamás.
    it('con los datos completos y sin foto, avisa específicamente la foto', async () => {
        const espiaModal = vi.spyOn(modal, 'setOpen');

        completarDatos();

        await componente.onAltaMesa();

        expect(espiaModal).toHaveBeenCalledWith('Datos inválidos', 'Debe cargar la foto de la mesa para continuar.');
        expect(componente.hayError('fotos', 'minLengthArray')).toBe(true);
    });

    it('marca un número de mesa menor a uno', async () => {
        completarDatos();
        componente.formulario.controls.numeroMesa.setValue(0);

        await componente.onAltaMesa();

        expect(componente.hayError('numeroMesa', 'min')).toBe(true);
    });
});
