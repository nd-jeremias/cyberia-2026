import { inject, Service } from '@angular/core';
import { NativeAudio } from '@capacitor-community/native-audio';
import { Platform } from '@ionic/angular';

@Service()
export class AudioService {
    // Lista de sonidos disponibles en tu app
    private sonidos = [
        { id: 'intro', asset: 'sounds/intro_sound.mp3' },
        { id: 'success', asset: 'sounds/success.mp3' },
    ];
    private audioInicializado = false;
    private ignorarAppState = false;

    private inicializacionAudio: Promise<void>;

    private platform = inject(Platform);

    constructor() {
        this.inicializacionAudio = this.inicializarSonidos();
    }

    /**
     * Precarga todos los sonidos en la memoria del dispositivo móvil
     */
    private async inicializarSonidos(): Promise<void> {
        await this.platform.ready();

        // Solo usamos NativeAudio en dispositivo
        if (this.platform.is('hybrid')) {
            try {
                for (const sonido of this.sonidos) {
                    console.log(`🔊 Precargando: ${sonido.id} -> ${sonido.asset}`);

                    await NativeAudio.preload({
                        assetId: sonido.id,
                        assetPath: sonido.asset,
                        audioChannelNum: 1,
                        isUrl: false,
                    });

                    console.log(`✅ Precargado: ${sonido.id}`);
                }

                this.audioInicializado = true;

                console.log('🔊 Todos los sonidos nativos precargados con éxito.');
            } catch (error) {
                console.error('❌ Error precargando sonidos nativos:', error);

                this.audioInicializado = false;
            }
        } else {
            console.log('🌐 Ejecutándose en entorno Web. Se usará Audio HTML5 de respaldo.');

            this.audioInicializado = true;
        }
    }

    /**
     * Reproduce un sonido mediante su ID
     * @param id Identificador del sonido (ej: 'click' o 'exito')
     */
    async reproducir(id: string) {
        console.log('🔊 reproducir() llamado:', id);

        if (this.platform.is('hybrid')) {
            // Esperamos a que todos los sonidos estén precargados
            await this.inicializacionAudio;
            console.log('🎵 audioInicializado:', this.audioInicializado);
            if (!this.audioInicializado) {
                console.warn('⚠️ NativeAudio no pudo inicializarse');
                return;
            }
            try {
                console.log(`▶️ Reproduciendo NativeAudio: ${id}`);
                await NativeAudio.play({
                    assetId: id,
                });
                console.log(`✅ NativeAudio.play completado: ${id}`);
            } catch (error) {
                console.error(`❌ Error reproduciendo ${id}:`, error);
            }
            return;
        }

        // =========================
        // WEB - Hay que corregir la ruta si se quiere reproducir el audio
        // =========================
        const sonidoWeb = this.sonidos.find((s) => s.id === id);
        if (!sonidoWeb) {
            console.warn(`⚠️ El sonido "${id}" no existe.`);
            return;
        }
        const audio = new Audio(sonidoWeb.asset);
        try {
            await audio.play();

            console.log(`✅ Sonido web reproducido: ${id}`);
        } catch (error) {
            console.error('❌ Error de reproducción web:', error);
        }
    }

    setIgnorarAppState(valor: boolean) {
        this.ignorarAppState = valor;
    }

    debeIgnorarAppState(): boolean {
        return this.ignorarAppState;
    }
}
