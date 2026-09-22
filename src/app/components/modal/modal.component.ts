import { Component, inject } from '@angular/core';
import { IonButton, IonButtons, IonHeader, IonModal, IonTitle, IonToolbar, IonFooter } from '@ionic/angular';
import { ModalService } from '../../services/modal.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    imports: [IonFooter, IonHeader, IonToolbar, IonTitle, IonButton, IonModal, IonButtons, FaIconComponent],
})
export class ModalComponent {
    modalService = inject(ModalService);
}
