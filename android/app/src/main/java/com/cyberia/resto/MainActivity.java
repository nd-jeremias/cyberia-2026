package com.cyberia.resto;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;

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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        View web = getBridge().getWebView();

        float escalaSistema = getResources().getConfiguration().fontScale;
        int zoom = Math.round(Math.min(escalaSistema, ESCALA_MAXIMA) * 100);

        WebSettings ajustes = ((android.webkit.WebView) web).getSettings();
        ajustes.setTextZoom(zoom);

        dejarLibreLaBarraDeNavegacion(web);
    }

    /**
     * Deja libre la barra de navegación del teléfono.
     *
     * Con targetSdk 36 Android dibuja la aplicación de borde a borde: la página
     * llega por debajo de la barra de abajo (la de los tres botones o la raya
     * de gestos). En CSS eso se corrige con env(safe-area-inset-bottom), pero
     * el WebView informa 0 para esa barra, así que los pies fijos —el botón
     * "Ver mi pedido" de la carta, la caja de texto del chat— quedaban tapados
     * en los teléfonos con los tres botones y bien en los que usan gestos.
     *
     * Acá se pregunta por el alto REAL de la barra y se agrega como espacio
     * abajo del WebView. Arriba no se toca a propósito: la banda naranja sigue
     * pintándose detrás de la barra de estado, que es como está diseñada.
     */
    private void dejarLibreLaBarraDeNavegacion(View web) {
        ViewCompat.setOnApplyWindowInsetsListener(web, (vista, ventana) -> {
            Insets barras = ventana.getInsets(WindowInsetsCompat.Type.systemBars());

            vista.setPadding(0, 0, 0, barras.bottom);

            return ventana;
        });
    }
}
