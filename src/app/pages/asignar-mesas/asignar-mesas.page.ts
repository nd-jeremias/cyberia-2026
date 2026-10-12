import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { IonBadge, IonContent } from '@ionic/angular';
import { ClienteInterface } from '../../interfaces/cliente.interface';
import { MesaInterface } from '../../interfaces/mesa.interface';
import { MesaService } from '../../services/mesa.service';
import { SalonService } from '../../services/salon.service';
import { ModalService } from '../../services/modal.service';
import { SpinnerService } from '../../services/spinner.service';
import { TarjetaUsuarioComponent } from '../../components/tarjeta-usuario/tarjeta-usuario.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NotificacionesService } from '../../services/notificaciones.service';

/**
 * Pantalla del metre: asignar una mesa a un cliente (punto 10).
 *
 * El flujo es de dos pasos deliberadamente: primero se elige el cliente y
 * después la mesa. Al revés habría que soltar la mesa si el cliente resulta no
 * poder tomarla, y esa reserva a medias es justo lo que causa mesas trabadas.
 *
 * Las verificaciones del enunciado viven en `MesaService`, no acá: son reglas
 * de negocio y deben valer sin importar desde qué pantalla se asigne. Las
 * consultas a Supabase también van por los servicios.
 */
@Component({
    selector: 'app-asignar-mesas',
    templateUrl: './asignar-mesas.page.html',
    styleUrls: ['./asignar-mesas.page.scss'],
    imports: [IonContent, IonBadge, FaIconComponent, TarjetaUsuarioComponent, HeaderComponent],
})
export class AsignarMesasPage implements OnInit, OnDestroy {
    private mesaService = inject(MesaService);
    private salonService = inject(SalonService);
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);
    private notificaciones = inject(NotificacionesService);

    clientes = signal<ClienteInterface[]>([]);
    clienteElegido = signal<ClienteInterface | null>(null);

    mesas = this.mesaService.mesas;
    mesasDisponibles = this.mesaService.disponibles;
    cargando = this.mesaService.cargando;

    // Si el cliente elegido ya tiene mesa, el metre debe poder indicarsela
    // en vez de simplemente no dejarlo avanzar (punto 10 del enunciado).
    /**
     * Mesa que el cliente elegido ya tiene, si tiene alguna.
     *
     * El enunciado pide indicarle al metre cuál es, no sólo impedir la
     * asignación: sin ese dato no sabría a dónde mandar al comensal.
     */
    mesaYaAsignada = computed(() => {
        const cliente = this.clienteElegido();

        return cliente ? this.mesaService.mesaDelCliente(cliente.id) : null;
    });

    ngOnInit() {
        this.cargarClientes();
        this.mesaService.listar();

        // La lista cambia desde otro teléfono: el cliente escanea el QR de la
        // puerta y tiene que aparecer acá sin que el metre recargue nada.
        this.salonService.escucharListaEspera(() => void this.cargarClientes());
    }

    ngOnDestroy() {
        void this.salonService.dejarDeEscuchar();
    }

    /**
     * Trae la lista de espera: los clientes que escanearon el QR de la puerta.
     *
     * No es la lista de todos los clientes del local, sino la de quienes están
     * esperando mesa ahora mismo (punto 9).
     */
    async cargarClientes() {
        this.spinner.show();

        try {
            this.clientes.set(await this.salonService.clientesParaAsignar());
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudieron cargar los clientes.';

            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.spinner.hide();
        }
    }

    async onSeleccionCliente(evento: { accion: string; usuario: ClienteInterface }) {
        if (evento.accion === 'quitar') {
            await this.quitarDeLista(evento.usuario);
            return;
        }

        this.clienteElegido.set(evento.usuario);
    }

    /** Saca al cliente de la lista de espera sin asignarle mesa (punto 9). */
    private async quitarDeLista(cliente: ClienteInterface) {
        try {
            await this.salonService.quitarDeListaEspera(cliente.id);

            // Si era el que estaba elegido, la selección deja de tener sentido.
            if (this.clienteElegido()?.id === cliente.id) {
                this.clienteElegido.set(null);
            }

            await this.cargarClientes();
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo quitar al cliente de la lista.';

            this.modal.setOpen('Error', mensaje, 'error');
        }
    }

    limpiarSeleccion() {
        this.clienteElegido.set(null);
    }

    /**
     * Intenta asignar la mesa al cliente seleccionado.
     *
     * Sólo se limpia la selección si la asignación salió bien; si falló, el
     * cliente sigue elegido para poder probar con otra mesa sin rebuscarlo.
     */
    async onAsignar(mesa: MesaInterface) {
        const cliente = this.clienteElegido();

        if (!cliente) {
            this.modal.setOpen('Falta el cliente', 'Seleccione primero al cliente al que le va a asignar la mesa.');

            return;
        }

        const asignada = await this.mesaService.asignarCliente(mesa.id, cliente.id);

        if (!asignada) return;

        // La mesa ya quedó tomada; ahora el cliente sale de la lista de espera
        // y pasa a 'mesa_asignada'. Si esto fallara quedaría una mesa ocupada
        // por alguien que sigue figurando en la lista, así que se avisa.
        try {
            await this.salonService.asignarMesa(cliente.id, mesa.id);
            await this.notificaciones.enviarAvisoAUsuario(
                cliente.id,
                'Mesa asignada.',
                `Se le asigno la mesa N° ${mesa.numeroMesa}, ya puede tomar asiento.`,
                'mesa-asignada'
            );
            this.modal.setOpen('Mesa asignada', `El cliente fue asignado a la mesa N° ${mesa.numeroMesa}.`);
        } catch (error) {
            const mensaje =
                error instanceof Error
                    ? error.message
                    : 'La mesa quedó tomada pero no se pudo actualizar el estado del cliente.';

            this.modal.setOpen('Revisar la asignación', mensaje, 'error');
        }

        this.clienteElegido.set(null);
        await this.cargarClientes();
    }
}
