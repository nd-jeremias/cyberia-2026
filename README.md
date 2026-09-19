# cyberia-2026

> Trabajo Final Integrador. Tecnicatura Universitaria en Programación. 2026.
> Repositorio grupal para el 2do Cuatrimestre.

---

## 📋 Índice

-   [Descripción General](#-descripción-general)
-   [Tecnologías Utilizadas](#%EF%B8%8F-tecnologías-utilizadas)
-   [Requisitos del Sistema](#-requisitos-del-sistema)
-   [Instalación y Configuración](#%EF%B8%8F-instalación-y-configuración)
-   [Guía Rápida de Git](#-guía-rápida-de-git)
-   [Arquitectura de Carpetas](#-arquitectura-de-carpetas)
-   [Guía de Compilación Nativa (Capacitor + Android)](<#-guía-de-compilación-nativa-(capacitor-+-android)>)
-   [Índice de Imágenes](#-índice-de-imágenes)
-   [Cronograma y Distribución de Tareas](#-cronograma-y-distribución-de-tareas)

---

## 🔍 Descripción General

El objetivo es desarrollar, implementar y documentar una aplicación totalmente funcional, utilizando las características de un dispositivo móvil para la gestión de un restaurante.
La aplicación estará enfocada en la experiencia de usuario, tanto de los clientes como de los empleados del comercio.

-   **Estado del proyecto:** En desarrollo 🛠️

---

## 🛠️ Tecnologías Utilizadas

Lista de las principales herramientas y frameworks utilizados en el proyecto:

-   **Framework Principal:** Ionic Framework
-   **Lenguaje:** Angular (con TypeScript)
-   **Estilos:** SASS / CSS
-   **Base de datos / Backend:** Supabase

---

## 💻 Requisitos del Sistema

```text
Ionic:

   Ionic CLI                     : 7.2.1 (C:\Users\ndjer\AppData\Roaming\npm\node_modules\@ionic\cli)
   Ionic Framework               : @ionic/angular 9.0.0
   @angular-devkit/build-angular : not installed
   @angular-devkit/schematics    : 22.1.5
   @angular/cli                  : 22.0.1
   @ionic/angular-toolkit        : 13.0.0

Capacitor:

   Capacitor CLI      : 8.5.0
   @capacitor/android : 8.5.0
   @capacitor/core    : 8.5.0
   @capacitor/ios     : not installed

Utility:

   cordova-res : not installed globally
   native-run  : 2.0.3

System:

   NodeJS : v24.19.0 (C:\Program Files\nodejs\node.exe)
   npm    : 11.17.0
   OS     : Windows 10

```

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para clonar y ejecutar el proyecto en tu máquina local:

1. **Clonar el repositorio:**
    ```bash
    git clone https://github.com/nd-jeremias/cyberia-2026.git
    ```
2. **Navegar a la carpeta del proyecto:**
    ```bash
    cd /cyberia-2026
    ```
3. **Instalar las dependencias de NPM:**
    ```bash
    npm install
    ```
4. **Levantar el servidor de desarrollo local:**
    ```bash
    ionic serve
    ```

### Datos de prueba en Supabase

Los scripts de la carpeta `sql/` se corren desde el **SQL Editor** de Supabase, en este orden:

| Script                        | Para qué sirve                                                                 |
| :---------------------------- | :----------------------------------------------------------------------------- |
| `usuarios.sql`                | Crea la tabla `usuarios`, los tipos ENUM y las cuentas `@test.com`.            |
| `usuarios-acceso-rapido.sql`  | Crea las cuentas `@restaurante.com` que usan los botones de **acceso rápido**. |
| `mesas.sql` / `productos.sql` | Salón y carta.                                                                 |
| `pedidos.sql`                 | Circuito del pedido.                                                           |
| `notificaciones.sql`          | Disparadores que mandan las notificaciones push (necesita `pg_net`).           |

> ⚠️ Sin `usuarios-acceso-rapido.sql` los botones de acceso rápido cargan credenciales que no existen y el ingreso falla: esas cuentas usan `@restaurante.com` con la contraseña `12345678`, que **no** son las que siembra `usuarios.sql` (`@test.com` con `Password123!`).

---

## 🌿 Guía Rápida de Git

Esta guía es de lectura obligatoria antes de iniciar cualquier tarea. Sigue estos pasos para evitar conflictos de código y pérdida de cambios realizados.

### 1. Flujo Diario de Trabajo (Paso a Paso)

-   **Paso 1: Actualizar tu entorno local (¡Hacer esto SIEMPRE al iniciar el día!)**

    ```bash
    git checkout main && git pull origin main
    ```

    _Moverse a la rama principal y descargar los últimos cambios de tus compañeros._

-   **Paso 2: Crear tu rama de trabajo**

    ```bash
    git switch nombre-de-tu-rama
    ```

    _Moverse a una rama propia basada en main para trabajar de forma segura._

-   **Paso 3: Guardar tus avances**

    ```bash
    git add .
    git commit -m "feat: descripción corta de lo que hiciste"
    ```

    _Prepara y guarda tus cambios localmente con un mensaje descriptivo._

-   **Paso 4: Enviar tus cambios al servidor**
    ```bash
    git push origin nombre-de-tu-rama
    ```
    _Sube tu rama a GitHub/GitLab para que el equipo pueda verla._

### 2. Comandos Esenciales y su Función

| Comando                | ¿Qué hace?                                          | ¿Cuándo usarlo?                                                                |
| :--------------------- | :-------------------------------------------------- | :----------------------------------------------------------------------------- |
| `git status`           | Muestra el estado de tus archivos.                  | Para ver qué archivos modificaste y cuáles no has guardado.                    |
| `git checkout <rama>`  | Te cambia de una rama a otra.                       | Para saltar entre tu rama de desarrollo y la rama principal (`main`).          |
| `git pull origin main` | Descarga los cambios más recientes del servidor.    | Al iniciar el día o antes de empezar una nueva tarea. **Obligatorio.**         |
| `git rebase main`      | Trae los cambios de main a tu rama de forma limpia. | **Luego de que se haga un merge en main.** Evita líneas de historial cruzadas. |

---

## 📂 Arquitectura de Carpetas

Para mantener el orden y evitar conflictos entre las tareas de los integrantes, el proyecto sigue estrictamente la siguiente estructura dentro del directorio `src/app/` y la raíz:

```text
📂 TFI/
├── 📂 sql/                        # Scripts y consultas para la base de datos de prueba
└── 📂 src/
    └── 📂 app/
        ├── 📂 componentes/        # Componentes reutilizables de la interfaz (botones, tarjetas, etc.)
        ├── 📂 interfaces/         # Modelos de datos y contratos de TypeScript (moldes de objetos)
        ├── 📂 paginas/            # Vistas principales de la aplicación (Login, Inicio, Perfil, etc.)
        ├── 📂 servicios/          # Lógica de negocio y peticiones HTTP (conexión con APIs o BD)
        ├── app-routing.module.ts  # Enrutador principal de Angular
        ├── app.component.ts       # Componente raíz del proyecto
        └── app.module.ts          # Módulo principal de la aplicación
```

> ⚠️ **Regla del equipo:** Antes de crear una nueva página o servicio, verifica que no exista en su carpeta correspondiente para evitar duplicar código.

---

## Guía de Compilación Nativa (Capacitor + Android)

Este proyecto utiliza **Capacitor** para envolver la aplicación web en un entorno nativo de Android. Dado que contamos con configuraciones personalizadas (notificaciones Push con Firebase y un Splash Screen animado en HTML/CSS), es fundamental seguir los flujos de trabajo descritos a continuación para no perder configuraciones críticas.

Los archivos de configuración nativa originales están respaldados en la carpeta raíz `android_backup/`.

---

### 🔄 Flujo Diario: Desplegar Cambios o Generar la APK

Utiliza este flujo siempre que realices cambios en el código TypeScript, HTML, CSS o assets dentro de Visual Studio Code y necesites probarlos en el celular o generar una nueva versión (APK/Bundle).

```bash
# 1. Compila los archivos web de Angular/Ionic (genera la carpeta www/)
ionic build

# 2. Sincroniza el código web y actualiza los plugins nativos en la carpeta de Android
npx cap sync

# 3. Abre el proyecto en Android Studio
npx cap open android

```

> 💡 **Nota de productividad:** Si ya tienes **Android Studio** abierto, no necesitas cerrarlo ni volver a ejecutar `npx cap open android`. El entorno detectará los cambios automáticamente. Solo ve a Android Studio y presiona el botón **Play (Run App)** o genera la APK desde el menú _Build > Build Bundle(s) / APK(s)_.

---

### 🚨 Flujo de Emergencia: Restaurar la carpeta Android desde cero

Si por algún motivo la carpeta `android/` se corrompe, se borra accidentalmente o se incluye por error en el `.gitignore` y necesitas recrear el entorno nativo sin romper las Notificaciones Push de Firebase ni los permisos personalizados, ejecuta la siguiente secuencia exacta:

```bash
# 1. Asegúrate de tener la última compilación web lista
ionic build

# 2. Añade la plataforma nativa de Android completamente limpia
npx cap add android

# 3. Restaura las configuraciones críticas desde la carpeta de respaldos
cp android_backup/google-services.json android/app/
cp android_backup/AndroidManifest.xml android/app/src/main/

# 4. Sincroniza de nuevo para que Gradle registre el archivo de Firebase y los permisos del manifiesto
npx cap sync

# 5. Abre el proyecto en Android Studio para compilar de forma definitiva
npx cap open android

```

#### ¿Por qué es necesario este orden?

-   **`npx cap add android`** crea una estructura genérica de Ionic. Si compilas directamente tras este paso, las notificaciones Push fallarán porque falta la vinculación con Firebase y el icono de la aplicación volverá a ser el por defecto.
-   **`cp`** devuelve nuestras credenciales secretas de Firebase (`google-services.json`) y el archivo de permisos personalizado (`AndroidManifest.xml`) a sus ubicaciones nativas obligatorias antes de que el compilador de Gradle intente empaquetar la app.

---

## 🖼️ Índice de Imágenes

### Boceto de páginas

<img src="assets\boceto.png" width="600" alt="Boceto"/>

---

### Favicon (web)

<img src="src/assets/icon/favicon.png" width="300" alt="Favicon"/>

---

### Ícono de la aplicación

<img src="assets/icon-only.png" width="300" alt="Ícono de la aplicación"/> <img src="assets\screenshots\Screenshot_icono_aplicacion.png" width="600" alt="Ícono desde el celular"/>

---

### Pantalla de presentación (splash screen)

<img src="assets\screenshots\Screenshot_splashscreen_logo.png" width="600" alt="Pantalla de Bienvenida (Logo)"/> <img src="assets\screenshots\Screenshot_splashscreen_nombres.png" width="600" alt="Pantalla de Bienvenida (Nombres)"/>

---

### Pantalla de Ingreso

<img src="assets\screenshots\Screenshot_pantalla_ingreso.png" width="600" alt="Pantalla de Ingreso"/> <img src="assets\screenshots\Screenshot_pantalla_ingreso_botones.png" width="600" alt="Pantalla de Ingreso Botones Acceso Rapido"/>

---

### Pantalla de Ingreso Anónimo

<img src="assets\screenshots\Screenshot_pantalla_ingreso_anonimo.png" width="600" alt="Pantalla de Ingreso Anónimo"/>

---

### Pantalla de Registro

<img src="assets\screenshots/Screenshot_pantalla_registro_1.png" width="600" alt="Pantalla de Registro"/> <img src="assets\screenshots/Screenshot_pantalla_registro_2.png" width="600" alt="Pantalla de Registro"/>

---

### Envio de Correos automatizados

<img src="assets\screenshots/Screenshot_correo_bandeja.jpg" width="600" alt="Bandeja de correos"/>
<img src="assets\screenshots/Screenshot_correo_solicitud.jpg" width="600" alt="Correo Solicitud"/>
<img src="assets\screenshots/Screenshot_correo_aprobado.jpg" width="600" alt="Correo Aprobado"/>
<img src="assets\screenshots/Screenshot_correo_rechazado.jpg" width="600" alt="Correo Rechazado"/>

---

<!-- ### Pantalla de Inicio

<img src="assets\screenshots\Screenshot_pantalla_inicio.png" width="600" alt="Pantalla de Inicio"/> -->

---

## 📅 Cronograma y Distribución de Tareas

A continuación se detalla la distribución tentativa de tareas para los integrantes del equipo.

> **05/09/2026:** Se modificaron las fechas de entrega, para enfocarnos sobre la corrección del día haciendo incapié en la estética general de la app.

### 👤 Jeremías, Nicolás (🚀 Alpha ) 🌿 Branch: nico-dev

| 📝 Tarea / Descripción                                    | 📅 F. Tentativa | ⏳ F. Real | ✅ Estado  |                                   Observaciones                                   |
| :-------------------------------------------------------- | :-------------: | :--------: | :--------: | :-------------------------------------------------------------------------------: |
| Configuración inicial del proyecto                        |   24/08/2026    | 23/08/2026 | Completado |                                                                                   |
| Creación de Base de Datos y datos de prueba (preliminar)  |   24/08/2026    | 23/08/2026 | Completado |                                                                                   |
| Diseño de icono y pantalla de presentación                |   26/08/2026    | 25/08/2026 | Completado |                       ✅ Corregir color de fondo del splash                       |
| Servicio de Lectura y Generación de QR + lectura DNI      |   26/08/2026    | 26/08/2026 | Completado |                  ✅ Verificar la funcionalidad del lector de DNI                  |
| Servicio de registro                                      |   --/--/----    | 26/08/2026 | Completado |                                                                                   |
| Servicio para manejo de "Carrito"                         |   27/08/2026    | 29/08/2026 | Completado |                                                                                   |
| Páginas dueño/supervisor + componentes necesarios         |   02/09/2026    | 18/09/2026 | Completado | Demora en la página general. Se avanzo solamente en la creacion de una nueva mesa |
| Servicio de Chat Mozo-Cliente                             |   --/--/----    | --/--/---- | Pendiente  |                                                                                   |
| **Puntos del TP a realizar:**                             |
| 1.- Agregar un empleado                                   |   02/09/2026    | 02/09/2026 | Completado |                                                                                   |
| 4.- Agregar una nueva mesa                                |   02/09/2026    | 04/09/2026 | Completado |                                                                                   |
| 6.- Verificar ingreso del cliente registrado              |   14/09/2026    | 18/09/2026 | Completado |                                                                                   |
| 7.- El dueño o supervisor rechaza a un cliente.           |   14/09/2026    | 18/09/2026 | Completado |                                                                                   |
| 8.- El dueño o supervisor acepta a un cliente registrado. |   14/09/2026    | 18/09/2026 | Completado |                                                                                   |

---

### 👤 Plucci, Kevin 🌿 Branch: kev-dev

| 📝 Tarea / Descripción                                                                       | 📅 F. Tentativa | ⏳ F. Real | ✅ Estado  |                          Observaciones                          |
| :------------------------------------------------------------------------------------------- | :-------------: | :--------: | :--------: | :-------------------------------------------------------------: |
| Creación de módulo ´formulario-ingreso´                                                      |   25/08/2026    | 23/08/2026 | Completado |                                                                 |
| Creación de interfaz de usuarios (autenticación, registro, cliente, usuario)                 |   25/08/2026    | 23/08/2026 | Completado |                                                                 |
| Creación de módulo: ´formulario-registro´,´formulario-alta-producto´, ´formulario-alta-mesa´ |   27/08/2026    | 25/08/2026 | Completado | ✅ Revisar la validación de datos antes de hacer el envío(emit) |
| Componente para listar Clientes Pendientes                                                   |   27/08/2026    | 27/08/2026 | Completado |  ✅ Crear una tarjeta `usuario` para modularizar y reutilizar   |
| Creación de módulo: ´formulario-usuario-anonimo´                                             |   27/08/2026    | 27/08/2026 | Completado |                                                                 |
| Servicio de Notificaciones Push                                                              |   27/08/2026    | 27/08/2026 | Completado |                   ✅ Revisar la funcionalidad                   |
| páginas metre/mozo + componentes necesarios                                                  |   04/09/2026    | 31/08/2026 | Completado |                                                                 |
| Servicio de manejo de pedidos                                                                |   31/08/2026    | 31/08/2026 | Completado |                                                                 |
| Servicio para manejo de "Mesa"-"Lista_espera"-"Productos"                                    |   02/09/2026    | 02/09/2026 | Completado |                                                                 |
| **Puntos del TP a realizar:**                                                                |
| 5.- Crear un cliente registrado                                                              |   02/09/2026    | 31/08/2026 | Completado |                                                                 |
| 10.- El metre asigna una mesa a un cliente registrado                                        |   02/09/2026    | 31/08/2026 | Completado |                                                                 |
| 13.- El mozo rechaza el pedido                                                               |   14/09/2026    | 12/09/2026 | Completado |                                                                 |
| 14.- El mozo confirma el pedido                                                              |   14/09/2026    | 12/09/2026 | Completado |                                                                 |
| 15.- El cliente accede a los juegos en busca de descuentos                                   |   12/09/2026    | 12/09/2026 | Completado |                                                                 |
| 19.- El mozo entrega el pedido completo                                                      |   14/09/2026    | 12/09/2026 | Completado |                                                                 |
| 22.- El mozo confirma el pago y se libera la mesa.                                           |   16/09/2026    | 12/09/2026 | Completado |                                                                 |

---

### 👤 Cura, Ezequiel 🌿 Branch: eze-dev

| 📝 Tarea / Descripción                                                                                             | 📅 F. Tentativa | ⏳ F. Real | ✅ Estado  |                                                       Observaciones                                                        |
| :----------------------------------------------------------------------------------------------------------------- | :-------------: | :--------: | :--------: | :------------------------------------------------------------------------------------------------------------------------: |
| Creación del servicio de autenticación                                                                             |   25/08/2026    | 23/08/2026 | Completado |                                                                                                                            |
| Creación de página de ´ingreso´                                                                                    |   25/08/2026    | 24/08/2026 | Completado |                                                                                                                            |
| Creación de página de ´home´                                                                                       |   27/08/2026    | 25/08/2026 | Completado | ✅ Aparece un mensaje de error antes de que termine de cargar la página. Revisar la línea 25 de `home.page.html`. Corregir |
| Estructura preliminar de todas las páginas(solo estructura)                                                        |   27/08/2026    | 25/08/2026 | Completado |                                                                                                                            |
| Componente ´tarjeta-producto´ + ´tarjeta-listado-producto´                                                         |   27/08/2026    | 26/08/2026 | Completado |                                                                                                                            |
| Creación de página de ´seleccion-productos´                                                                        |   28/08/2026    | 26/08/2026 | Completado |                                                                                                                            |
| Páginas cocinero/cantinero + componentes necesarios                                                                |   04/09/2026    | --/--/---- | Pendiente  |                                                                                                                            |
| Servicio de facturación                                                                                            |    --/-/----    | --/--/---- | Pendiente  |                                                                                                                            |
| **Puntos del TP a realizar:**                                                                                      |
| 2.- Agregar un nuevo plato                                                                                         |   02/09/2026    | 02/09/2026 | Completado |                                                  ✅ Correccion de errores                                                  |
| 3.- Agregar una nueva bebida                                                                                       |   02/09/2026    | 02/09/2026 | Completado |                                                                                                                            |
| 9.- Ingresar al local como un cliente anónimo                                                                      |   14/09/2026    | 14/09/2026 | Completado |                            ✅ Reevaluar la fecha conciderando relaciones con otros componentes                             |
| 11.- Al cargar el código QR de la mesa (en el dispositivo del cliente), se permite ver el listado de los productos |   14/09/2026    | 14/09/2026 | Completado |                                                                                                                            |
| 12.- El cliente procede a realizar el pedido para todos los comensales de la mesa.                                 |   14/09/2026    | 14/09/2026 | Completado |                          Falta revisar que el pedido sea enviado a los sectores correspondientes                           |
| 21.- El cliente solicita la cuenta al mozo.                                                                        |   23/09/2026    | --/--/---- | Pendiente  |                                                                                                                            |

---

### 👤 Maida, Cristian 🌿 Branch: dev-cristian | cris-dev

| 📝 Tarea / Descripción                                                | 📅 F. Tentativa | ⏳ F. Real | ✅ Estado  |                         Observaciones                          |
| :-------------------------------------------------------------------- | :-------------: | :--------: | :--------: | :------------------------------------------------------------: |
| Creación de componentes de ´ingreso-rapido´                           |   25/08/2026    | 23/08/2026 | Completado |                                                                |
| Establecer estilos globales (utilizar variables Ionic)                |   25/08/2026    | 23/08/2026 | Completado | ✅ Revisar colores generales. Corregir estilos de formularios. |
| Servicio captura de Fotografía por Cámara                             |   25/08/2026    | 25/08/2026 | Completado |                                                                |
| Servicio de subida de imágenes desde galería                          |   25/08/2026    | 25/08/2026 | Completado |                                                                |
| Creación de página de ´registro´                                      |   25/08/2026    | 23/08/2026 | Completado |                                                                |
| Servicio + Componente de Modal                                        |   27/08/2026    | 25/08/2026 | Completado |                                                                |
| Servicio + Componente de Spinner                                      |   27/08/2026    | 25/08/2026 | Completado |                                                                |
| Servicio de envío de correos (https://www.emailjs.com/)               |   --/--/----    | 28/08/2026 | Completado |                                                                |
| Página de registro cliente (metre)                                    |    --/-/----    | 04/09/2026 | Completado |                                                                |
| Gráficos de estadísticas                                              |   --/--/----    | --/--/---- | Pendiente  |                                                                |
| Juegos                                                                |   --/--/----    | --/--/---- | Pendiente  |                                                                |
| **Puntos del TP a realizar:**                                         |
| 16.- El sector cocina recibe los productos correspondientes           |   14/09/2026    | --/--/---- | En Proceso |                                                                |
| 17.- El sector bar recibe los productos correspondientes              |   14/09/2026    | --/--/---- | Pendiente  |                                                                |
| 18.- Cada sector verifica el pedido completo.                         |   14/09/2026    | --/--/---- | Pendiente  |                                                                |
| 15.- El cliente accede a la sección de juegos en busca de descuentos. |   16/09/2026    | --/--/---- | Pendiente  |                                                                |
| 20.- El cliente accede a la encuesta                                  |   19/09/2026    | --/--/---- | Pendiente  |                                                                |

---

_Nota: La fecha real se actualizará únicamente al momento de realizar el deploy o commit final de la tarea._

## Objetivo: 03/10

> **Aprobación de la primer parte:** La fecha de entrega es el 17-10-2026. El objetivo es tener hasta el punto 22 realizado para el 03-10-2026 (dos semanas antes de la entrega). De esta manera podríamos disponer una semana para revisar los detalles (estéticos y funcionales) y una semana para corrección de errores y generar la apk unificada en todos los dispositivos
