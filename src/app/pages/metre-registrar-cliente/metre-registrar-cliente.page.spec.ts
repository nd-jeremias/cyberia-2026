import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetreRegistrarClientePage } from './metre-registrar-cliente.page';

describe('MetreRegistrarClientePage', () => {
    let component: MetreRegistrarClientePage;
    let fixture: ComponentFixture<MetreRegistrarClientePage>;

    beforeEach(() => {
        fixture = TestBed.createComponent(MetreRegistrarClientePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
