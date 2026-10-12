import { Injectable, signal } from '@angular/core';

type IonicColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';

@Injectable({
    providedIn: 'root',
})
export class SpinnerService {
    isLoading = signal(false);
    color = signal<IonicColor>('primary');

    show(config?: { color?: IonicColor }) {
        this.color.set(config?.color ?? 'primary');

        this.isLoading.set(true);
    }

    hide() {
        this.isLoading.set(false);
    }
}
