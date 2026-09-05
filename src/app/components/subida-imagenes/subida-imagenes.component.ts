import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChangeDetectorRef, Component, effect, inject, input, NgZone, output } from '@angular/core';
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
    galeriaService = inject(GaleriaService);
    camaraService = inject(CameraService);
    platform = inject(Platform);

    imagenesChange = output<File[]>();
    // Las que ya estaban guardadas y siguen en pie después de editar.
    urlsExistentesChange = output<string[]>();

    maxImages = input<number>(3);
    modoCamara = input<'camara' | 'galeria'>('galeria');
    direccionCamara = input<'frontal' | 'trasera'>('frontal');
    label = input<string>('');
    /**
     * Habilita un botón extra para elegir la foto de la galería.
     *
     * Opt-in y apagado por defecto a propósito: sólo los productos admiten
     * galería (puntos 2 y 3), mientras que el registro de usuarios la prohíbe
     * expresamente ("no se tiene que elegir desde la galería", puntos 1 y 5).
     */
    permitirGaleria = input<boolean>(false);
    // URLs ya guardadas (edición): se muestran como preview desde el arranque.
    imagenesIniciales = input<string[]>([]);

    imageSlots: ImageSlot[] = [{ file: null, previewUrl: null }]; // Array que maneja los slots de imágenes (empieza con uno vacío)

    faSquarePlus = faSquarePlus;
    faSquareMinus = faSquareMinus;

    private zone = inject(NgZone);
    private cdr = inject(ChangeDetectorRef);

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

        if (!this.platform.is('hybrid')) {
            modoCamara = 'galeria';
        }

        try {
            const capturada =
                modoCamara === 'galeria'
                    ? await this.obtenerDeGaleria(index)
                    : await this.obtenerDeCamara(index, direccionCamara);

            // Sin foto: el usuario canceló. No es un error que haya que avisar.
            if (!capturada) return;

            this.guardarEnSlot(index, capturada.file, capturada.previewUrl);
        } catch (error) {
            // Cancelar la cámara también llega acá como excepción, así que se
            // registra y se corta: no se propaga para no dejar una promesa
            // rechazada sin atender colgando del click del template.
            console.error('Error procesando la imagen:', error);
        }
    }

    /** Abre la galería para un slot puntual, sin importar el modo del componente. */
    async abrirGaleria(index: number) {
        if (this.imageSlots.length > this.maxImages()) return;

        try {
            const capturada = await this.obtenerDeGaleria(index);

            if (!capturada) return;

            this.guardarEnSlot(index, capturada.file, capturada.previewUrl);
        } catch (error) {
            console.error('Error procesando la imagen:', error);
        }
    }

    private async obtenerDeGaleria(index: number): Promise<{ file: File; previewUrl: string } | null> {
        const results = await this.galeriaService.subirImagen(1);
        const item = results?.[0];

        if (!item?.webPath) return null;

        // Los datos binarios puros (Blob) salen de la ruta temporal de Capacitor.
        const response = await fetch(item.webPath);
        const blobPuro = await response.blob();

        return {
            file: new File([blobPuro], `foto_${index}_${Date.now()}.jpg`, {
                type: blobPuro.type, // Mantiene 'image/jpeg' o el formato original
            }),
            previewUrl: item.webPath,
        };
    }

    private async obtenerDeCamara(
        index: number,
        direccionCamara?: 'frontal' | 'trasera'
    ): Promise<{ file: File; previewUrl: string } | null> {
        const foto = await this.camaraService.tomarFoto(direccionCamara ?? 'frontal');

        if (!foto) return null;

        return {
            file: new File([foto.blob], `foto_${index}_${Date.now()}.jpg`, {
                type: foto.blob.type || 'image/jpeg',
            }),
            previewUrl: foto.previewUrl,
        };
    }

    /**
     * Coloca la foto en su slot, abre el siguiente y avisa al formulario.
     *
     * Centralizado a propósito: antes cada origen resolvía esto por su cuenta y
     * la rama de la cámara no abría el slot siguiente, así que con `maxImages`
     * mayor a uno no se podía cargar la segunda foto.
     */
    private guardarEnSlot(index: number, file: File, previewUrl: string) {
        // La respuesta de la cámara vuelve fuera de la zona de Angular, así que
        // se reemplaza el arreglo y se fuerza el redibujado desde adentro.
        this.zone.run(() => {
            const nuevosSlots = [...this.imageSlots];
            nuevosSlots[index] = { file, previewUrl };
            this.imageSlots = nuevosSlots;

            if (index === this.imageSlots.length - 1 && this.imageSlots.length < this.maxImages()) {
                this.imageSlots.push({ file: null, previewUrl: null });
            }

            this.cdr.detectChanges();

            this.emitirImagenes();
        });
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

        const urlsExistentes = this.imageSlots.map((slot) => slot.urlExistente).filter((url): url is string => !!url);

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
