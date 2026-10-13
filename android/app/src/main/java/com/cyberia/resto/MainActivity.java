package com.cyberia.resto;

import android.graphics.Color;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

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

    /** El crema del papel (--hoja). Es el fondo de casi todas las pantallas. */
    private static final int COLOR_HOJA = Color.parseColor("#F0E4D2");

    private WebView web;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = (WebView) getBridge().getWebView();

        float escalaSistema = getResources().getConfiguration().fontScale;
        int zoom = Math.round(Math.min(escalaSistema, ESCALA_MAXIMA) * 100);

        WebSettings ajustes = web.getSettings();
        ajustes.setTextZoom(zoom);

        // La franja que queda libre abajo muestra el fondo del WebView: con el
        // blanco de fábrica se veía una banda clara bajo el papel crema.
        web.setBackgroundColor(COLOR_HOJA);

        escucharBarrasDelSistema();
    }

    /**
     * Resuelve las dos barras del sistema, que Android dibuja encima de la app.
     *
     * Con targetSdk 36 la página se dibuja de borde a borde. En CSS eso se
     * corrige con env(safe-area-inset-*), pero el WebView de Android informa 0
     * para las dos barras, así que el encabezado quedaba debajo de la hora y la
     * batería, y los pies fijos debajo de los botones de navegación. En un
     * teléfono con gestos casi no se nota; en uno con los tres botones, tapa.
     *
     * Las dos se resuelven distinto a propósito:
     *
     *   - ABAJO se agrega espacio al WebView. Ahí no hay nada que mostrar
     *     detrás de la barra, y así ninguna pantalla tiene que acordarse.
     *   - ARRIBA se publica el alto como la variable CSS `--barra-superior`,
     *     que usa la banda naranja para bajar su contenido. Si se agregara
     *     espacio, la banda dejaría de pintarse detrás de la barra de estado y
     *     quedaría una franja de otro color, que es como se ve ahora mal.
     */
    private void escucharBarrasDelSistema() {
        ViewCompat.setOnApplyWindowInsetsListener(web, (vista, ventana) -> {
            Insets barras = ventana.getInsets(WindowInsetsCompat.Type.systemBars());

            vista.setPadding(0, 0, 0, barras.bottom);

            publicarBarraSuperior(barras.top);

            return ventana;
        });
    }

    /** Pasa el alto de la barra de estado a CSS, en píxeles de CSS. */
    private void publicarBarraSuperior(int altoEnPixeles) {
        DisplayMetrics pantalla = getResources().getDisplayMetrics();

        // El WebView trabaja en píxeles de CSS y Android en píxeles físicos:
        // sin dividir por la densidad, en un teléfono moderno el margen daría
        // como el triple de lo que mide la barra.
        float alto = altoEnPixeles / pantalla.density;

        String js = "document.documentElement.style.setProperty('--barra-superior', '" + alto + "px');";

        // Se corre en el hilo de la interfaz, que es el único que puede tocar
        // el WebView, y se repite en cada cambio de barras (girar, dividir
        // pantalla), así el valor nunca queda viejo.
        web.post(() -> web.evaluateJavascript(js, null));
    }
}
