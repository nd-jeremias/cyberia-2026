import { Component, inject, input, OnInit } from '@angular/core';
import { QrCodeComponent } from 'ng-qrcode';
import { QrService } from '../../services/qr.service';

@Component({
    selector: 'app-qr-generate',
    templateUrl: './qr-generate.component.html',
    styleUrls: ['./qr-generate.component.scss'],
    imports: [QrCodeComponent],
})
export class QrGenerateComponent implements OnInit {
    constructor() {}

    ngOnInit() {}

    qrService = inject(QrService)
}