import { inject, Service } from '@angular/core';
import { NativeAudio } from '@capacitor-community/native-audio';
import { Platform } from '@ionic/angular';

@Service()
export class AudioService {
    // Lista de sonidos disponibles en tu app
    private sonidos = [
        { id: 'click', asset: 'assets/sounds/click.mp3' },
        { id: 'intro', asset: 'assets/sounds/intro_sound.mp3' },
        { id: 'intro2', asset: 'assets/sounds/intro_sound_2.mp3' },
        { id: 'intro3', asset: 'assets/sounds/intro_sound_3.mp3' },
        { id: 'intro4', asset: 'assets/sounds/intro_sound_4.mp3' },
    ];

    private audioInicializado = false;
    private platform = inject(Platform)

    constructor() {
        // Inicializamos los sonidos tan pronto como la plataforma esté lista
        this.platform.ready().then(() => {
            this.inicializarSonidos();
        });
    }

    /**
     * Precarga todos los sonidos en la memoria del dispositivo móvil
     */
    private async inicializarSonidos() {
        // Solo usamos NativeAudio si estamos en un dispositivo móvil real (iOS/Android)
        if (this.platform.is('hybrid')) {
            try {
                for (const sonido of this.sonidos) {
                    await NativeAudio.preload({
                        assetId: sonido.id,
                        assetPath: sonido.asset,
                        audioChannelNum: 1,
                        isUrl: false,
                    });
                }
                this.audioInicializado = true;
                console.log('Todos los sonidos nativos precargados con éxito.');
            } catch (error) {
                console.error('Error precargando sonidos nativos:', error);
            }
        } else {
            console.log('Ejecutándose en entorno Web. Se usará Audio HTML5 de respaldo.');
        }
    }

    /**
     * Reproduce un sonido mediante su ID
     * @param id Identificador del sonido (ej: 'click' o 'exito')
     */
    async reproducir(id: string) {
        // 1. Comportamiento en Dispositivo Móvil (Nativo)
        if (this.platform.is('hybrid')) {
            if (this.audioInicializado) {
                try {
                    await NativeAudio.play({ assetId: id });
                } catch (error) {
                    console.error(`Error al reproducir el sonido nativo ${id}:`, error);
                }
            }
            return;
        }

        // 2. Respaldo para entorno Web/Navegador (Ideal para desarrollo en 'ionic serve')
        const sonidoWeb = this.sonidos.find((s) => s.id === id);
        if (sonidoWeb) {
            const audio = new Audio(sonidoWeb.asset);
            audio.play().catch((err) => console.log('Error de reproducción web (interacción requerida):', err));
        } else {
            console.warn(`El sonido con ID "${id}" no existe.`);
        }
    }
}
