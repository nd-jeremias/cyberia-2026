# cyberia-2026

> Trabajo Final Integrador. Tecnicatura Universitaria en Programacion. 2026.
> Repositorio grupal para el 2do Cuatrimestre.

---

## 📋 Índice

-   [Descripción General](#-descripción-general)
-   [Tecnologías Utilizadas](#%EF%B8%8F-tecnologías-utilizadas)
-   [Requisitos del Sistema](#-requisitos-del-sistema)
-   [Instalación y Configuración](#%EF%B8%8F-instalación-y-configuración)
-   [Arquitectura de Carpetas](#-arquitectura-de-carpetas)
-   [Guía Rápida de Git](#-guía-rápida-de-git)
-   [Cronograma y Distribución de Tareas](#-cronograma-y-distribución-de-tareas)

---

## 🔍 Descripción General

El objetivo es realizar, implementar y documentar una aplicación totalmente funcional, utilizando las características de un dispositivo móvil para la gestión de un restaurante.
La aplicación estará enfocada en la experiencia de usuario, tanto de los clientes cómo de los empleados del comercio.

-   **Estado del proyecto:** En desarrollo 🛠️

---

## 🛠️ Tecnologías Utilizadas

Lista de las principales herramientas y frameworks del proyecto:

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

---

## 🌿 Guía Rápida de Git

Esta guía es de lectura obligatoria antes de iniciar cualquier tarea. Sigue estos pasos para evitar conflictos de código y pérdida de cambios.

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

    _Moverse a una rama propia basada en para trabajar de forma segura._

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

## 📅 Cronograma y Distribución de Tareas

A continuación se detalla la distribución tentativa de tareas para los integrantes del equipo.

### 👤 Jeremías, Nicolás

| 📝 Tarea / Descripción                                   | 📅 F. Tentativa | ⏳ F. Real | ✅ Estado  |
| :------------------------------------------------------- | :-------------: | :--------: | :--------: |
| Configuración inicial del proyecto                       |   24/08/2026    | 23/08/2026 | Completado |
| Creación de Base de Datos y datos de prueba (preliminar) |   24/08/2026    | 23/08/2026 | Completado |
| Diseño de icono y pantalla de presentación               |   26/08/2026    | --/--/---- | En proceso |
| Servicio de Lectura y Generación de QR                   |   26/08/2026    | --/--/---- | Pendiente  |
| Listado de Aprobación de Clientes Pendientes             |   --/--/----    | --/--/---- | Pendiente  |

---

### 👤 Plucci, Kevin

| 📝 Tarea / Descripción                                                       | 📅 F. Tentativa | ⏳ F. Real | ✅ Estado  |
| :--------------------------------------------------------------------------- | :-------------: | :--------: | :--------: |
| Creación de modulo ´formulario-ingreso´                                      |   25/08/2026    | 23/08/2026 | Completado |
| Creación de interfaz de usuarios (autenticacion, registro, cliente, usuario) |   25/08/2026    | 23/08/2026 | Completado |
| Creación de modulo: ´formulario-registro´,´formulario-alta-producto´, ´formulario-alta-mesa´ |   27/08/2026    | --/--/---- | Pendiente |

---

### 👤 Cura, Ezequiel

| 📝 Tarea / Descripción                 | 📅 F. Tentativa | ⏳ F. Real | ✅ Estado  |
| :------------------------------------- | :-------------: | :--------: | :--------: |
| Creación del servicio de autenticación |   25/08/2026    | 23/08/2026 | Completado |
| Creación de página de ´ingreso´        |   25/08/2026    | 24/08/2026 | Completado  |
| Componente ´tarjeta-producto´ + ´tarjeta-listado-producto´ | 27/08/2026 | --/--/---- | Pendiente |
| Creación de página de ´seleccion-productos´ | 28/08/2026 |  --/--/---- | Pendiente |

---

### 👤 Maida, Cristian

| 📝 Tarea / Descripción                                 | 📅 F. Tentativa | ⏳ F. Real | ✅ Estado  |
| :----------------------------------------------------- | :-------------: | :--------: | :--------: |
| Creación de componentes de ´ingreso-rapido´            |   25/08/2026    | 23/08/2026 | Completado |
| Establecer estilos globales (Utilizar variables Ionic) |   25/08/2026    | 23/08/2026 | En proceso |
| Servicio captura de Fotografía por Cámara              |   25/08/2026    | --/--/---- | Pendiente  |
| Servicio de subida de imágenes desde galería           |   25/08/2026    | --/--/---- | Pendiente  |

_Nota: La fecha real se actualizará únicamente al momento de realizar el deploy o commit final de la tarea._