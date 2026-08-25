import { Component, inject, input, OnInit } from '@angular/core';
import { QrCodeComponent } from 'ng-qrcode';
import { QrService } from '../../services/qr.service';
import { IonButton } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-qr-generate',
    templateUrl: './qr-generate.component.html',
    styleUrls: ['./qr-generate.component.scss'],
    imports: [FontAwesomeModule, IonButton, QrCodeComponent,],
})
export class QrGenerateComponent implements OnInit {
    constructor() {}

    ngOnInit() {}

    faShareNodes = faShareNodes

    qrService = inject(QrService);
}
