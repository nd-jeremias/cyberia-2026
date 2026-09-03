import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAnonimoComponent } from './modal-anonimo.component';

describe('ModalAnonimoComponent', () => {
    let component: ModalAnonimoComponent;
    let fixture: ComponentFixture<ModalAnonimoComponent>;

    beforeEach(() => {
        fixture = TestBed.createComponent(ModalAnonimoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
