import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidosSectorPage } from './pedidos-sector.page';

describe('PedidosSectorPage', () => {
    let component: PedidosSectorPage;
    let fixture: ComponentFixture<PedidosSectorPage>;

    beforeEach(() => {
        fixture = TestBed.createComponent(PedidosSectorPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
