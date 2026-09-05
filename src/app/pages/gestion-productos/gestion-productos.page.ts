import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
    AlertController,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
} from '@ionic/angular';
import { TarjetaListadoProductoComponent } from '../../components/tarjeta-listado-producto/tarjeta-listado-producto.component';
import { Producto, TipoProducto } from '../../interfaces/producto.interface';
import { PerfilUsuario } from '../../interfaces/auth.interface';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { SpinnerService } from '../../services/spinner.service';
import { ProductosService } from '../../services/productos.service';

// El mismo listado sirve para cocinero (platos) y cantinero (bebidas):
// el tipo a mostrar/crear sale del perfil logueado, no de la URL.
const TIPO_POR_PERFIL: Partial<Record<PerfilUsuario, TipoProducto>> = {
    cocinero: 'Comida',
    cantinero: 'Bebida',
};

/**
 * Administración de la carta: platos, bebidas y postres (puntos 2 y 3).
 *
 * Pantalla todavía sin implementar: por ahora sólo tiene el armazón
 * generado y la ruta declarada.
 */
@Component({
    selector: 'app-gestion-productos',
    templateUrl: './gestion-productos.page.html',
    styleUrls: ['./gestion-productos.page.scss'],
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButtons,
        IonBackButton,
        IonButton,
        IonIcon,
        TarjetaListadoProductoComponent,
    ],
})
export class GestionProductosPage {
    private authService = inject(AuthService);
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);
    private productosService = inject(ProductosService);
    private alertCtrl = inject(AlertController);
    private router = inject(Router);

    tipo = computed(() => TIPO_POR_PERFIL[this.authService.perfil() ?? 'cliente registrado'] ?? null);
    esBebida = computed(() => this.tipo() === 'Bebida');
    titulo = computed(() => (this.esBebida() ? 'Gestión de bebidas' : 'Gestión de platos'));
    textoBotonCrear = computed(() => (this.esBebida() ? 'Nueva bebida' : 'Nuevo plato'));

    // Título del listado. Es distinto al de la barra superior a propósito: si
    // fueran el mismo texto, la pantalla arrancaba con el mismo título repetido
    // dos veces, uno debajo del otro.
    tituloListado = computed(() => (this.esBebida() ? 'Bebidas en la carta' : 'Platos en la carta'));

    productos = signal<Producto[]>([]);

    // Último tipo que se llegó a pedir, para no repetir la consulta cuando el
    // efecto y el ciclo de vida de la página se solapan en la primera entrada.
    private tipoCargado: TipoProducto | null = null;

    constructor() {
        // Cubre entrar directo por URL: el perfil se resuelve asincrónicamente,
        // así que el tipo puede llegar después de crearse la página.
        effect(() => {
            const tipo = this.tipo();
            if (tipo && tipo !== this.tipoCargado) this.cargarProductos(tipo);
        });
    }

    // Ionic mantiene viva la página al navegar, así que al volver del alta o
    // de la edición no se re-crea el componente: sin este hook la lista queda
    // con los datos viejos hasta refrescar a mano.
    //
    // La primera entrada la resuelve el efecto de arriba (`tipoCargado` todavía
    // en null), así que acá sólo se recarga al volver de otra pantalla.
    ionViewWillEnter() {
        const tipo = this.tipo();
        if (tipo && this.tipoCargado) this.cargarProductos(tipo);
    }

    private async cargarProductos(tipo: TipoProducto) {
        this.tipoCargado = tipo;
        this.spinner.show();

        try {
            const productos = await this.productosService.listarPorTipo(tipo);
            this.productos.set(productos);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los productos.';
            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }

    irACrear() {
        const tipo = this.tipo();
        if (!tipo) return;

        this.router.navigate(['/alta-producto'], { queryParams: { tipo } });
    }

    onEditar(producto: Producto) {
        this.router.navigate(['/alta-producto'], {
            queryParams: { tipo: producto.tipo, productoId: producto.id },
        });
    }

    async onEliminar(producto: Producto) {
        const alerta = await this.alertCtrl.create({
            header: 'Eliminar producto',
            message: `¿Seguro que querés eliminar "${producto.nombre}" de la carta?`,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                { text: 'Eliminar', role: 'destructive', handler: () => this.confirmarEliminar(producto) },
            ],
        });

        await alerta.present();
    }

    private async confirmarEliminar(producto: Producto) {
        this.spinner.show();

        try {
            await this.productosService.eliminar(producto.id);
            this.productos.update((actuales) => actuales.filter((p) => p.id !== producto.id));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo eliminar el producto.';
            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }
}
