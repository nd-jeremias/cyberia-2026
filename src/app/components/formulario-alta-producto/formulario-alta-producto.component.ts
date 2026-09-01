import { Component, computed, effect, input, output } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonInput,
    IonItem,
    IonTextarea,
} from '@ionic/angular';
import {
    Producto,
    ProductoAltaInterface,
    TipoProducto,
} from '../../interfaces/producto.interface';
import { SubidaImagenesComponent } from '../subida-imagenes/subida-imagenes.component';

const CANTIDAD_FOTOS_REQUERIDA = 3;

@Component({
    selector: 'app-formulario-alta-producto',
    templateUrl: './formulario-alta-producto.component.html',
    styleUrls: ['./formulario-alta-producto.component.scss'],
    imports: [
        IonCard,
        IonCardContent,
        IonCardHeader,
        IonCardTitle,
        IonInput,
        IonItem,
        IonTextarea,
        IonButton,
        ReactiveFormsModule,
        SubidaImagenesComponent,
    ],
})
export class FormularioAltaProductoComponent {
    // El tipo lo define la pagina segun el perfil que la renderiza
    // (cocinero -> Comida/Postre, cantinero -> Bebida), no el usuario.
    tipo = input.required<TipoProducto>();

    // Si viene cargado, el formulario entra en modo edicion: precarga los
    // campos y las fotos pasan a ser opcionales (vacio = mantener las
    // actuales, 3 nuevas = reemplazarlas; la tabla exige siempre 3).
    productoExistente = input<Producto | null>(null);

    productoSubmit = output<ProductoAltaInterface>();

    modoEdicion = computed(() => this.productoExistente() !== null);
    tituloFormulario = computed(() => (this.modoEdicion() ? 'Editar producto' : `Nuevo producto (${this.tipo()})`));
    textoBoton = computed(() => (this.modoEdicion() ? 'Guardar cambios' : 'Dar de alta'));

    fotos: File[] = [];

    formulario = new FormGroup({
        nombre: new FormControl('', {
            validators: [Validators.required],
        }),
        descripcion: new FormControl('', {
            validators: [Validators.required],
        }),
        tiempoElaboracionMinutos: new FormControl<number | null>(null, {
            validators: [Validators.required, Validators.min(1)],
        }),
        precio: new FormControl<number | null>(null, {
            validators: [Validators.required, Validators.min(0.01)],
        }),
    });

    constructor() {
        effect(() => {
            const producto = this.productoExistente();
            if (!producto) return;

            this.formulario.setValue({
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                tiempoElaboracionMinutos: producto.tiempoElaboracionMinutos,
                precio: producto.precio,
            });
        });
    }

    onFotosSeleccionadas(fotos: File[]) {
        this.fotos = fotos;
    }

    private fotosValidas(): boolean {
        if (this.fotos.length === CANTIDAD_FOTOS_REQUERIDA) return true;

        // En edicion, dejar las fotos vacías significa "mantener las actuales".
        return this.modoEdicion() && this.fotos.length === 0;
    }

    onAltaProducto() {
        if (this.formulario.invalid || !this.fotosValidas()) return;

        const valores = this.formulario.getRawValue();

        this.productoSubmit.emit({
            nombre: valores.nombre ?? '',
            descripcion: valores.descripcion ?? '',
            tiempoElaboracionMinutos: Number(valores.tiempoElaboracionMinutos),
            precio: Number(valores.precio),
            tipo: this.tipo(),
            fotos: this.fotos,
        });
    }
}
