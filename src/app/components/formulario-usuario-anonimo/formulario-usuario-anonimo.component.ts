import { Component, inject, output, signal } from '@angular/core';
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
    IonIcon,
    IonInput,
    IonItem,
} from '@ionic/angular';
import { AnonimoAltaInterface } from '../../interfaces/cliente.interface';
import { FotoInterface } from '../../interfaces/foto.interface';
import { CameraService } from '../../services/camera.service';
import { ModalService } from '../../services/modal.service';

/**
 * Alta de cliente anónimo (punto 9 del enunciado).
 *
 * Pide sólo nombre y foto, que es todo lo que necesita un invitado. Estos
 * clientes no requieren aprobación, a diferencia de los registrados del
 * punto 5, y entran con una sesión anónima de Supabase.
 */
@Component({
    selector: 'app-formulario-usuario-anonimo',
    templateUrl: './formulario-usuario-anonimo.component.html',
    styleUrls: ['./formulario-usuario-anonimo.component.scss'],
    imports: [
        IonCard,
        IonCardContent,
        IonCardHeader,
        IonCardTitle,
        IonInput,
        IonItem,
        IonIcon,
        IonButton,
        ReactiveFormsModule,
    ],
})
export class FormularioUsuarioAnonimoComponent {
    private camara = inject(CameraService);
    private modal = inject(ModalService);

    anonimoSubmit = output<AnonimoAltaInterface>();

    foto = signal<FotoInterface | null>(null);

    formulario = new FormGroup({
        nombres: new FormControl('', {
            validators: [Validators.required, Validators.minLength(2)],
        }),
    });

    /**
     * Toma la foto con la cámara frontal.
     *
     * Es frontal porque se trata de una selfie de ingreso. Los fallos se
     * informan al usuario: el servicio ya registra el detalle técnico.
     */
    async onTomarFoto() {
        try {
            const capturada = await this.camara.tomarFoto('frontal');

            if (capturada) this.foto.set(capturada);
        } catch {
            // El servicio ya registra el detalle; aca solo avisamos al usuario.
            this.modal.setOpen(
                'No se pudo tomar la foto',
                'Revise los permisos de la cámara e intente nuevamente.'
            );
        }
    }

    onRegistrar() {
        const fotoActual = this.foto();

        if (this.formulario.invalid || !fotoActual) {
            this.modal.setOpen(
                'Datos incompletos',
                'Ingrese su nombre y tome una foto para continuar.'
            );
            return;
        }

        this.anonimoSubmit.emit({
            nombres: this.formulario.getRawValue().nombres ?? '',
            foto: fotoActual.blob,
        });
    }
}
