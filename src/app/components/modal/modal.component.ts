import { Component, inject } from '@angular/core';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar, IonFooter } from '@ionic/angular';
import { ModalService } from '../../services/modal.service';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    imports: [IonFooter, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonModal, IonButtons],
})
export class ModalComponent {
    modalService = inject(ModalService);



}
