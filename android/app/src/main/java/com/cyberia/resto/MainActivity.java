package com.cyberia.resto;

import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    /**
     * Tope para el "Tamaño de fuente" del sistema (Ajustes > Pantalla).
     *
     * El WebView de Android agranda TODO el texto de la app según ese ajuste.
     * Con la letra del sistema en grande, los títulos se partían ("Empleado s"),
     * los nombres se salían de las fichas del login y algunos paneles se
     * desarmaban, mientras en otros teléfonos se veía bien.
     *
     * No se anula del todo, porque quien agranda la letra lo necesita para leer:
     * se respeta hasta un 10 % más grande, que es lo que el diseño aguanta.
     */
    private static final float ESCALA_MAXIMA = 1.10f;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        float escalaSistema = getResources().getConfiguration().fontScale;
        int zoom = Math.round(Math.min(escalaSistema, ESCALA_MAXIMA) * 100);

        WebSettings ajustes = getBridge().getWebView().getSettings();
        ajustes.setTextZoom(zoom);
    }
}
