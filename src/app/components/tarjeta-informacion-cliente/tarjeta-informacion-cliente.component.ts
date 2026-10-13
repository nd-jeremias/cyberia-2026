import { Component, input, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-tarjeta-informacion-cliente',
    templateUrl: './tarjeta-informacion-cliente.component.html',
    styleUrls: ['./tarjeta-informacion-cliente.component.scss'],
    imports: [FaIconComponent],
})
export class TarjetaInformacionClienteComponent implements OnInit {
    texto = input<string>('');

    constructor() {}

    ngOnInit() {}
}
