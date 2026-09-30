import { Component, input, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PedidoInterface } from '../../interfaces/pedido.interface';

@Component({
    selector: 'app-tarjeta-factura',
    templateUrl: './tarjeta-factura.component.html',
    styleUrls: ['./tarjeta-factura.component.scss'],
    imports: [DatePipe, DecimalPipe],
})
export class TarjetaFacturaComponent implements OnInit {
    pedido = input<PedidoInterface | null>();
    constructor() {}

    ngOnInit() {}
}
