# Guía de Testing — rama `testing-uat`

Esta rama concentra la verificación del proyecto. Documenta qué se prueba, cómo
se ejecuta y qué decisiones técnicas hay detrás.

---

## Índice

- [Cómo ejecutar las pruebas](#cómo-ejecutar-las-pruebas)
- [Requisito previo: la ruta del proyecto](#requisito-previo-la-ruta-del-proyecto)
- [Niveles de prueba](#niveles-de-prueba)
- [Qué está cubierto](#qué-está-cubierto)
- [Cómo escribir un test nuevo](#cómo-escribir-un-test-nuevo)
- [Decisiones de diseño que habilitaron las pruebas](#decisiones-de-diseño-que-habilitaron-las-pruebas)
- [Errores encontrados gracias a las pruebas](#errores-encontrados-gracias-a-las-pruebas)

---

## Cómo ejecutar las pruebas

```bash
npm run test          # unitarios, en modo interactivo
npm run test:ci       # unitarios, una sola corrida (para integración continua)
npm run e2e           # extremo a extremo, levanta la aplicación sola
npm run e2e:ui        # extremo a extremo con interfaz para depurar
npm run verificar     # lint + unitarios + build, todo junto
```

`npm run verificar` es el comando que conviene correr **antes de cada push**:
reproduce lo mismo que se revisa al integrar.

---

## Requisito previo: la ruta del proyecto

> ⚠️ **Los tests unitarios no se descubren si la ruta del proyecto contiene
> paréntesis.**

El proyecto suele estar en `Documentos/TPI (NUEVO)/cyberia-2026`. Esos
paréntesis rompen el descubrimiento de archivos.

**Causa.** El builder `@angular/build:unit-test` encuentra los archivos y se los
pasa a Vitest como rutas absolutas. Vitest las interpreta como patrones glob, y
en un glob `(` y `)` son caracteres especiales, así que el patrón no coincide
con ningún archivo. El resultado es un desconcertante `No test files found`
aunque los archivos estén ahí.

Se verificó con la propia librería de globs del proyecto:

| Patrón                              | Coincidencias |
| :---------------------------------- | :------------ |
| Absoluto con paréntesis             | 0             |
| Absoluto con paréntesis escapados   | 3             |
| Relativo, con `cwd`                 | 3             |

**No se puede resolver por configuración**: el builder descarta cualquier
`test.include` que se declare en un archivo de configuración de Vitest y emite
una advertencia al respecto.

**Solución.** Clonar o mover el proyecto a una ruta sin paréntesis:

```
C:\dev\cyberia-2026        ✅
D:\proyectos\cyberia-2026  ✅
```

Un enlace simbólico o junction **no sirve**: Node resuelve la ruta real.

---

## Niveles de prueba

| Nivel | Herramienta | Qué verifica | Dónde vive |
| :---- | :---------- | :----------- | :--------- |
| Unitario | Vitest + TestBed | Lógica de servicios y componentes en aislamiento | `src/**/*.spec.ts` |
| Extremo a extremo | Playwright | La aplicación real en un navegador | `e2e/*.spec.ts` |
| Estático | TypeScript + ESLint | Tipos, plantillas y estilo | `npm run verificar` |

### Unitario

Corren sobre jsdom, sin navegador y sin red. Cada dependencia externa se
reemplaza por un doble mediante `TestBed`. Son rápidos (menos de 5 segundos la
suite completa), así que conviene dejarlos en `--watch` mientras se programa.

### Extremo a extremo

Playwright levanta la aplicación por su cuenta, la abre en Chrome de escritorio
y en un Pixel 7 emulado, y la recorre como una persona. Detectan lo que los
unitarios no pueden ver: rutas mal declaradas, imports rotos, guards que no
protegen y errores de consola al arrancar.

Sólo guardan evidencia (captura, video, traza) de lo que falla.

### Estático

`ngc` con `strictTemplates` revisa **también las plantillas HTML**, no sólo el
TypeScript. ESLint cubre las convenciones de Angular.

---

## Qué está cubierto

### Servicios

| Servicio | Foco de las pruebas |
| :------- | :------------------ |
| `PedidoService` | Cálculo de tiempo estimado y totales, transiciones de estado, manejo de errores de la base |
| `MesaService` | Las tres verificaciones del punto 10: cliente con mesa previa, mesa ocupada y asignación simultánea |
| `NotificacionesService` | Contador de no leídas, marcado, y la guarda de plataforma |
| `VibracionService` | Que nunca lance en entornos sin soporte de vibración |

### Componentes

| Componente | Foco de las pruebas |
| :--------- | :------------------ |
| `FormularioRegistroComponent` | Validadores por campo, coincidencia de contraseñas y avisos al enviar |
| `LoginFormComponent` | Validación, credenciales de ingreso rápido y avisos |
| `TarjetaUsuarioComponent` | Datos derivados, acciones configurables y datos opcionales |

### Extremo a extremo

- Arranque de la aplicación sin errores de consola.
- Rutas públicas accesibles.
- Rutas privadas protegidas por el guard.
- Los formularios avisan sus errores en pantalla.

---

## Cómo escribir un test nuevo

### Un servicio que usa Supabase

Nunca se importa el cliente directamente: se inyecta `SupabaseService` y en el
test se lo reemplaza por un doble.

```ts
class SupabaseFalso {
    from = vi.fn();
    auth = { getSession: vi.fn() };
    cliente = {} as never;
}

TestBed.configureTestingModule({
    providers: [{ provide: SupabaseService, useValue: new SupabaseFalso() }],
});
```

> `vi.mock()` con rutas relativas **no funciona** en este proyecto: el sistema
> de pruebas de Angular no lo admite y sugiere usar `TestBed`, que además es la
> forma correcta de sustituir dependencias inyectadas.

### Un componente con plantilla

Si el componente usa `routerLink` hay que proveer el router:

```ts
await TestBed.configureTestingModule({
    imports: [MiComponente],
    providers: [provideRouter([])],
}).compileComponents();
```

Para pasarle `input()`, se usa `fixture.componentRef.setInput(...)` y luego
`fixture.detectChanges()`.

---

## Decisiones de diseño que habilitaron las pruebas

### `SupabaseService` inyectable

Los servicios importaban la constante `supabase` directamente. Eso los ataba a
una implementación concreta y **los volvía imposibles de probar sin salir a la
red**: una violación del principio de inversión de dependencias.

Se agregó una envoltura inyectable. La constante sigue exportándose para el
código que ya la usaba, así que el cambio no rompe nada.

### `VibracionService`

La vibración estaba dispersa en cuatro archivos llamando a `Haptics`
directamente. Se concentró en un servicio que absorbe los fallos, por dos
motivos: responsabilidad única, y porque la vibración es un refuerzo del aviso,
nunca un requisito para que el aviso ocurra.

### Preparación del entorno (`src/test-setup.ts`)

jsdom no implementa todo lo que Ionic da por sentado. El archivo documenta y
completa cada pieza: `matchMedia`, `Element.animate` y la ruta base de los
íconos.

---

## Errores encontrados gracias a las pruebas

Estas pruebas no son decorativas: encontraron defectos reales.

### 1. La vibración impedía ver los mensajes de error

`Haptics.notification()` lanza una excepción en entornos sin soporte de
vibración. Como se llamaba **antes** de abrir el modal, la excepción cortaba el
flujo y el aviso nunca aparecía.

En un navegador de escritorio, un formulario inválido no mostraba nada. El
usuario veía un botón que parecía roto.

Corregido con `VibracionService`.

### 2. Métodos de validación perdidos en un merge

`hayError()` y `passwordsNoCoinciden` habían desaparecido de
`FormularioRegistroComponent` durante una integración, dejando la plantilla sin
sus mensajes por campo. El test no compiló y lo detectó de inmediato.

Es exactamente el tipo de regresión silenciosa que justifica tener tests.

---

## Pendientes

- Cobertura de `AuthService`: requiere doblar el flujo de sesión de Supabase.
- Pruebas de las páginas de metre y mozo contra una base de datos de prueba.
- Integrar `npm run verificar` en un flujo automático al abrir un pull request.
