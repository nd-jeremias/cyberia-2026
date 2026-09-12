import { Component, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonIcon, IonInput } from '@ionic/angular';
import { AnonimoAltaInterface } from '../../interfaces/cliente.interface';
import { ModalService } from '../../services/modal.service';
import { SubidaImagenesComponent } from '../subida-imagenes/subida-imagenes.component';
import { FileService } from '../../services/file.service';
import { RouterLink } from '@angular/router';

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
    imports: [IonIcon, IonInput, ReactiveFormsModule, SubidaImagenesComponent, RouterLink],
})
export class FormularioUsuarioAnonimoComponent {
    private modal = inject(ModalService);
    private fileService = inject(FileService);
    anonimoSubmit = output<AnonimoAltaInterface>();

    direccionCamara = input<'frontal' | 'trasera'>('frontal');
    foto: File[] = [];

    formulario = new FormGroup({
        nombres: new FormControl('', {
            validators: [Validators.required, Validators.minLength(2)],
        }),
        foto: new FormControl<File[]>([], {
            validators: [this.fileService.minLengthArray(1)],
        }),
    });

    onRegistrar() {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();

            this.modal.setOpen(
                'Datos incompletos',
                'Ingrese su nombre y tome una foto para continuar.'
            );

            return;
        }

        // El componente de subida trabaja con un arreglo aunque acá el máximo
        // sea una sola foto, así que se toma la primera.
        const [foto] = this.foto;

        if (!foto) {
            this.modal.setOpen(
                'Falta la foto',
                'Tome una foto para poder ingresar al local.'
            );

            return;
        }

        this.anonimoSubmit.emit({
            nombres: this.formulario.getRawValue().nombres ?? '',
            foto,
        });
    }

    recibirImagenes(imagenes: File[]) {
        this.foto = imagenes;

        // Almacena el array de Files directamente en el formulario
        this.formulario.patchValue({ foto: imagenes });

        // Opcional: Marca el control como "dirty" o "touched" para la validación
        this.formulario.get('foto')?.markAsTouched();
    }
}
