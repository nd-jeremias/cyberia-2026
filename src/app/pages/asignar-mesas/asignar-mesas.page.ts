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

@Component({
    selector: 'app-asignar-mesas',
    templateUrl: './asignar-mesas.page.html',
    styleUrls: ['./asignar-mesas.page.scss'],
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButton,
        IonBadge,
        IonIcon,
        TarjetaUsuarioComponent,
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
