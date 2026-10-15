import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonRadio, IonRadioGroup, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HeaderComponent } from '../../../components/header/header.component';
import { AuthService } from '../../../services/auth.service';
import { SalonService } from '../../../services/salon.service';
import { PedidoService } from '../../../services/pedido.service';
import { EncuestasService } from '../../../services/encuestas.service';
import { ModalOption, ModalService } from '../../../services/modal.service';
import { SpinnerService } from '../../../services/spinner.service';

@Component({
    selector: 'app-completar', // <-- Selector único para esta página
    templateUrl: './completar.page.html',
    styleUrls: ['./completar.page.scss'],
    standalone: true,
    imports: [
        IonContent,
        IonSelect,
        IonSelectOption,
        IonTextarea,
        FontAwesomeModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HeaderComponent,
        IonRadioGroup,
        IonRadio,
    ],
})
export class CompletarPage {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private salon = inject(SalonService);
    private pedidoService = inject(PedidoService);
    private encuestasService = inject(EncuestasService);
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);
    private router = inject(Router);

    cargando = signal(true);
    mesaId: string | null = null;
    pedidoId: string | null = null;

    tipoSeleccionado = signal<string>('Seleccionar');

    form = this.fb.group({
        calificacionComida: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
        atencionMozo: ['Excelente', Validators.required],
        tiempoEspera: ['Aceptable', Validators.required],
        recomiendaLugar: [true, Validators.required],
        comentario: [''],
    });

    async ionViewWillEnter() {
        await this.verificarAcceso();
        // this.mesaId = '36e7805f-940b-4d58-a261-1160a2212345';
        // this.pedidoId = '11111111-2222-3333-4444-555555555555';
        // this.cargando.set(false);
    }

    seleccionarEstrellas(valor: number) {
        this.form.get('calificacionComida')?.setValue(valor);
    }

    hayError(control: string, error: string): boolean {
        const campo = this.form.get(control);
        return !!campo && campo.touched && campo.hasError(error);
    }

    async seleccionarTiempoEspera() {
        // if (document.activeElement instanceof HTMLElement) {
        //     document.activeElement.blur();
        // }
        const opciones: ModalOption[] = [
            { texto: 'Rápido', icono: 'bolt', value: 'Rápido' },
            { texto: 'Aceptable', icono: 'clock', value: 'Aceptable' },
            { texto: 'Lento', icono: 'hourglass-half', value: 'Lento' },
        ];

        const seleccion = await this.modal.setOpenSelect('Tiempo de Espera', opciones);
        if (seleccion) {
            this.form.get('tiempoEspera')?.setValue(seleccion);
            this.tipoSeleccionado.set(seleccion);
        }
    }

    async verificarAcceso() {
        this.cargando.set(true);
        const usuarioId = this.auth.session()?.user.id;
        if (!usuarioId) {
            this.cargando.set(false);
            this.modal.setOpen('Atención', 'Debes iniciar sesión para completar la encuesta.');
            this.router.navigate(['/inicio']);
            return;
        }

        // 1. Verificar mesa asignada
        const situacion = await this.salon.cargarSituacion(usuarioId);
        if (!situacion?.mesaId) {
            this.cargando.set(false);
            this.modal.setOpen('Sin mesa asignada', 'Solo puedes responder la encuesta teniendo una mesa asignada.');
            this.router.navigate(['/encuestas']);
            return;
        }
        this.mesaId = situacion.mesaId;

        // 2. Verificar que el pedido actual esté recibido o pagado
        const pedidoActual = await this.pedidoService.pedidoActualDelCliente(usuarioId);
        const estadosValidos = ['Recibido', 'Pagado'];
        if (!pedidoActual || !estadosValidos.includes(pedidoActual.estado)) {
            this.cargando.set(false);
            this.modal.setOpen('Pedido en curso', 'Podrás responder la encuesta una vez que hayas recibido tu pedido.');
            this.router.navigate(['/encuestas']);
            return;
        }
        this.pedidoId = pedidoActual.id;

        // 3. Verificar si ya completó la encuesta para este pedido puntual
        const yaRespondio = await this.encuestasService.yaCompletoEncuestaDeEstadia(usuarioId, this.pedidoId);
        if (yaRespondio) {
            this.cargando.set(false);
            this.modal.setOpen('Encuesta completada', 'Ya completaste la encuesta de esta visita.');
            this.router.navigate(['/encuestas/resultados']);
            return;
        }

        this.cargando.set(false);
    }

    async enviarEncuesta() {
        if (this.form.invalid || !this.mesaId || !this.pedidoId) return;

        const usuarioId = this.auth.session()?.user.id;
        if (!usuarioId) return;

        this.spinner.show();
        try {
            const val = this.form.value;
            await this.encuestasService.guardarEncuesta({
                clienteId: usuarioId,
                mesaId: this.mesaId,
                pedidoId: this.pedidoId,
                calificacionComida: Number(val.calificacionComida),
                atencionMozo: val.atencionMozo as any,
                tiempoEspera: val.tiempoEspera as any,
                recomiendaLugar: !!val.recomiendaLugar,
                comentario: val.comentario ?? '',
            });

            this.modal.setOpen('¡Muchas gracias!', 'Tu opinión fue registrada correctamente.', 'info');
            // Al terminar de enviar, va directo a ver los gráficos
            this.router.navigate(['/encuestas']);
        } catch (e: any) {
            this.modal.setOpen('Error', e.message || 'No se pudo registrar la encuesta.');
        } finally {
            this.spinner.hide();
        }
    }
}
