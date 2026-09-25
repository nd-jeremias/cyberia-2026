import { Component, computed, input, OnInit, output } from '@angular/core';
import { MesaInterface } from '../../interfaces/mesa.interface';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-tarjeta-mesa',
    templateUrl: './tarjeta-mesa.component.html',
    styleUrls: ['./tarjeta-mesa.component.scss'],
    imports: [FaIconComponent],
})
export class TarjetaMesaComponent implements OnInit {
    mesa = input.required<MesaInterface>();
    editarMesa = output<MesaInterface>();
    eliminarMesa = output<MesaInterface>();
    verQrMesa = output<MesaInterface>();

    constructor() {}

    ngOnInit() {}

    onEditar() {
        this.editarMesa.emit(this.mesa());
    }

    onEliminar() {
        this.eliminarMesa.emit(this.mesa());
    }

    onVerQr() {
        this.verQrMesa.emit(this.mesa());
    }
}
