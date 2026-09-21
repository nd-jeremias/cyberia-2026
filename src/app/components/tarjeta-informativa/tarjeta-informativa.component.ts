import { Component, input, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-tarjeta-informativa',
    templateUrl: './tarjeta-informativa.component.html',
    styleUrls: ['./tarjeta-informativa.component.scss'],
    imports: [FaIconComponent],
})
export class TarjetaInformativaComponent implements OnInit {

    advertencia = input<boolean>(false)

    constructor() {}

    ngOnInit() {}
}
