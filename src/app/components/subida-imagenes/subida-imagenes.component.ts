import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Component, effect, inject, input, output } from '@angular/core';
import { IonButton, Platform } from '@ionic/angular';
import { faSquareMinus, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { FileService } from '../../services/file.service';
import { ModalService } from '../../services/modal.service';
import { GaleriaService } from '../../services/galeria.service';
import { CameraService } from '../../services/camera.service';


interface ImageSlot {
    file: File | null;
    previewUrl: string | null;
    // Sólo lo tienen los slots que vienen de la base (edición). Si el usuario
    // borra el slot, esa URL deja de emitirse y la foto se da de baja.
    urlExistente?: string | null;
}
@Component({
    selector: 'app-subida-imagenes',
    templateUrl: './subida-imagenes.component.html',
    styleUrls: ['./subida-imagenes.component.scss'],
    imports: [IonButton, FontAwesomeModule],
})
export class SubidaImagenesComponent {


    archivosService = inject(FileService);
    modal = inject(ModalService);
    galeriaService = inject(GaleriaService)
    camaraService = inject(CameraService)
    platform = inject(Platform);

    imagenesChange = output<File[]>();
    // Las que ya estaban guardadas y siguen en pie después de editar.
    urlsExistentesChange = output<string[]>();

    maxImages = input<number>(3);
    modoCamara = input<'camara' | 'galeria'>('galeria')
    direccionCamara = input<'frontal' | 'trasera'>('frontal')
    label = input<string>("")
    // URLs ya guardadas (edición): se muestran como preview desde el arranque.
    imagenesIniciales = input<string[]>([]);

    imageSlots: ImageSlot[] = [{ file: null, previewUrl: null }]; // Array que maneja los slots de imágenes (empieza con uno vacío)

    faSquarePlus = faSquarePlus;
    faSquareMinus = faSquareMinus;

    constructor() {
        // Las imágenes iniciales llegan asincrónicamente (hay que ir a buscar
        // el producto), así que se siembran los slots cuando aparecen.
        effect(() => {
            const urls = this.imagenesIniciales();

            if (urls.length === 0) return;

            this.imageSlots = urls.map((url) => ({ file: null, previewUrl: url, urlExistente: url }));

            if (this.imageSlots.length < this.maxImages()) {
                this.imageSlots.push({ file: null, previewUrl: null });
            }

            this.emitirImagenes();
        });
    }

    constructor() {
        // Las imágenes iniciales llegan asincrónicamente (hay que ir a buscar
        // el producto), así que se siembran los slots cuando aparecen.
        effect(() => {
            const urls = this.imagenesIniciales();

            if (urls.length === 0) return;

            this.imageSlots = urls.map((url) => ({ file: null, previewUrl: url, urlExistente: url }));

            if (this.imageSlots.length < this.maxImages()) {
                this.imageSlots.push({ file: null, previewUrl: null });
            }

            this.emitirImagenes();
        });
    }

    async subirImagen(index: number, modoCamara: 'camara' | 'galeria', direccionCamara?: 'frontal' | 'trasera') {
        
        if (this.imageSlots.length > this.maxImages()) {
            this.modal.setOpen(
                'Límite de imágenes alcanzado',
                'No puedes subir más de ' + this.maxImages() + ' imágenes.'
            );
            return;
        }

        if (!this.platform.is('hybrid')){
            modoCamara = 'galeria'
        }
        
        try {
            let results = null;
            let item = null;

            if (modoCamara === 'galeria') {
                results = await this.galeriaService.subirImagen(1);

                if (results && results.length > 0) {
                    item = results[0];

                    if (!item.webPath) return;
                    // 2. Obtenemos los datos binarios puros (Blob) desde la ruta temporal de Capacitor
                    const response = await fetch(item?.webPath!);
                    const blobPuro = await response.blob();

                    // 3. Convertimos el Blob en un File real dándole un nombre único
                    const nombreArchivo = `foto_${index}_${Date.now()}.jpg`;
                    const archivoFile = new File([blobPuro], nombreArchivo, {
                        type: blobPuro.type, // Mantiene 'image/jpeg' o el formato original
                    });

                    this.imageSlots[index] = { file: archivoFile, previewUrl: item.webPath };

                    if (index === this.imageSlots.length - 1) {
                        this.imageSlots.push({ file: null, previewUrl: null });
                    }

                    this.emitirImagenes();
                }
            } else {
                results = await this.camaraService.tomarFoto(direccionCamara ?? 'frontal');
                if (results) {
                    // this.fotoPreview = results.previewUrl; // Usar en <img [src]="fotoPreview">
                    // Convertimos el Blob en un File con nombre y tipo explícito
                    const archivoFoto = new File([results.blob], `selfie_${Date.now()}.jpg`, {
                        type: 'image/jpeg',
                    });

                    this.imageSlots[index] = { file: archivoFoto, previewUrl: results.previewUrl };
                }
            }
        } catch (error) {
            console.error('Error procesando la imagen:', error);
        }
    }

    async onFileSelected(event: Event, index: number) {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            if (!this.archivosService.isValidTypeImg(file)) {
                // Retornar valor para pasarle al formulario
                return;
            }

            if (!this.archivosService.isValidFileSize(file, 5)) {
                // Retornar valor para pasarle al formulario
                return;
            }

            // Generar URL temporal para mostrar la vista previa en el HTML
            const previewUrl = await this.archivosService.generatePreview(file);

            // Guardar el archivo y la preview en el slot correspondiente
            this.imageSlots[index] = { file, previewUrl };

            // LÓGICA DINÁMICA: Si modificamos el último slot disponible, añadimos uno nuevo vacío
            if (index === this.imageSlots.length - 1) {
                this.imageSlots.push({ file: null, previewUrl: null });
            }

            this.emitirImagenes();
        }
    }

    private emitirImagenes() {
        const archivos = this.imageSlots.map((slot) => slot.file).filter((file): file is File => file !== null);

        this.imagenesChange.emit(archivos);

        const urlsExistentes = this.imageSlots
            .map((slot) => slot.urlExistente)
            .filter((url): url is string => !!url);

        this.urlsExistentesChange.emit(urlsExistentes);
    }

    removeImage(index: number) {
        // Sólo las previews locales son object URLs; las que vienen de la base
        // son URLs públicas y no hay nada que liberar.
        if (this.imageSlots[index].previewUrl && !this.imageSlots[index].urlExistente) {
            URL.revokeObjectURL(this.imageSlots[index].previewUrl!);
        }

        // Eliminar el slot del array
        this.imageSlots.splice(index, 1);

        // Siempre tiene que quedar un slot vacío al final para poder reemplazar
        // la foto recién borrada (con 3 fotos cargadas no había ninguno).
        const haySlotLibre = this.imageSlots.some((slot) => !slot.previewUrl);

        if (!haySlotLibre && this.imageSlots.length < this.maxImages()) {
            this.imageSlots.push({ file: null, previewUrl: null });
        }

        if (this.imageSlots.length === 0) {
            this.imageSlots.push({ file: null, previewUrl: null });
        }

        this.emitirImagenes();
    }
}
