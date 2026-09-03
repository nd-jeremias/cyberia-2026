import { Component, computed, effect, inject, input, output } from '@angular/core';
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
import { ModalService } from '../../services/modal.service';

// La tabla `productos` tiene un CHECK que exige exactamente tres fotos. Se
// valida acá también para no llegar a la base con un alta que va a rebotar.
const CANTIDAD_FOTOS_REQUERIDA = 3;

/**
 * Alta de producto: platos, bebidas y postres (puntos 2 y 3 del enunciado).
 *
 * El mismo formulario sirve para los tres tipos. El tipo no lo elige el
 * usuario sino la página, según el perfil que la abrió: el cocinero carga
 * platos y el cantinero bebidas.
 */
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
    private modal = inject(ModalService);

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
    fotosIniciales = computed(() => this.productoExistente()?.fotosUrls ?? []);

    // Fotos nuevas elegidas ahora y fotos ya guardadas que se conservan: entre
    // las dos tienen que sumar las tres que exige la tabla.
    fotos: File[] = [];
    fotosUrlsExistentes: string[] = [];

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

    onUrlsExistentes(urls: string[]) {
        this.fotosUrlsExistentes = urls;
    }

    private cantidadFotos(): number {
        return this.fotos.length + this.fotosUrlsExistentes.length;
    }

    onAltaProducto() {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            this.modal.setOpen('Datos incompletos', 'Revisá los campos marcados antes de guardar.');
            return;
        }

        if (this.cantidadFotos() !== CANTIDAD_FOTOS_REQUERIDA) {
            this.modal.setOpen(
                'Faltan fotos',
                `El producto necesita exactamente ${CANTIDAD_FOTOS_REQUERIDA} fotos y ahora tiene ${this.cantidadFotos()}.`
            );
            return;
        }

        const valores = this.formulario.getRawValue();

        this.productoSubmit.emit({
            nombre: valores.nombre ?? '',
            descripcion: valores.descripcion ?? '',
            tiempoElaboracionMinutos: Number(valores.tiempoElaboracionMinutos),
            precio: Number(valores.precio),
            tipo: this.tipo(),
            fotos: this.fotos,
            fotosUrlsExistentes: this.fotosUrlsExistentes,
        });
    }
}
