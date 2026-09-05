import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
    IonBadge,
    IonButton,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
} from '@ionic/angular';
import { ClientePendienteInterface } from '../../interfaces/cliente.interface';
import { MesaInterface } from '../../interfaces/mesa.interface';
import { MesaService } from '../../services/mesa.service';
import { ModalService } from '../../services/modal.service';
import { supabase } from '../../services/supabase.service';
import { TarjetaUsuarioComponent } from '../../components/tarjeta-usuario/tarjeta-usuario.component';
import { HeaderComponent } from '../../components/header/header.component';

/**
 * Pantalla del metre: asignar una mesa a un cliente (punto 10).
 *
 * El flujo es de dos pasos deliberadamente: primero se elige el cliente y
 * después la mesa. Al revés habría que soltar la mesa si el cliente resulta no
 * poder tomarla, y esa reserva a medias es justo lo que causa mesas trabadas.
 *
 * Las verificaciones del enunciado viven en `MesaService`, no acá: son reglas
 * de negocio y deben valer sin importar desde qué pantalla se asigne.
 */
@Component({
    selector: 'app-asignar-mesas',
    templateUrl: './asignar-mesas.page.html',
    styleUrls: ['./asignar-mesas.page.scss'],
    imports: [
        IonContent,
        IonButton,
        IonBadge,
        IonIcon,
        TarjetaUsuarioComponent,
        HeaderComponent
    ],
})
export class AsignarMesasPage implements OnInit {
    private mesaService = inject(MesaService);
    private modal = inject(ModalService);

    clientes = signal<ClientePendienteInterface[]>([]);
    clienteElegido = signal<ClientePendienteInterface | null>(null);

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

    accionesTarjeta = [
        {
            id: 'elegir',
            etiqueta: 'Seleccionar',
            icono: 'hand-right',
            color: 'primary',
        },
    ];

    ngOnInit() {
        this.cargarClientes();
        this.mesaService.listar();
    }

    /**
     * Trae los clientes registrados que pueden recibir mesa.
     *
     * Se filtra por estado Activo porque un cliente pendiente o rechazado no
     * debería siquiera aparecer como opción (puntos 5, 7 y 8).
     */
    async cargarClientes() {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select(
                    'id, nombres, apellidos, dni, correo_electronico, foto_url, estado, fecha_registro'
                )
                .eq('perfil', 'cliente registrado')
                .eq('estado', 'Activo')
                .order('apellidos', { ascending: true });

            if (error) throw error;

            this.clientes.set(
                (data ?? []).map((fila) => ({
                    id: fila.id,
                    nombres: fila.nombres,
                    apellidos: fila.apellidos,
                    dni: fila.dni,
                    correo: fila.correo_electronico,
                    fotoUrl: fila.foto_url,
                    estado: 'Activo' as const,
                    fechaRegistro: fila.fecha_registro,
                }))
            );
        } catch (error) {
            const mensaje =
                error instanceof Error
                    ? error.message
                    : 'No se pudieron cargar los clientes.';

            this.modal.setOpen('Error', mensaje);
        }
    }

    onSeleccionCliente(evento: {
        accion: string;
        usuario: ClientePendienteInterface;
    }) {
        this.clienteElegido.set(evento.usuario);
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
            this.modal.setOpen(
                'Falta el cliente',
                'Seleccione primero al cliente al que le va a asignar la mesa.'
            );

            return;
        }

        const asignada = await this.mesaService.asignarCliente(
            mesa.id,
            cliente.id
        );

        if (asignada) this.clienteElegido.set(null);
    }
}
