# LMB 2026 · Ficha visual de equipo

Landing page estática para consultar posiciones y estadísticas de equipos de la Liga Mexicana de Beisbol durante la temporada 2026, construida a partir del API público de MLB Stats.

El objetivo del entregable es transformar una prueba funcional de datos en una experiencia visual más cercana al ecosistema de la LMB: clara, editorial, responsive y fácil de leer para fans.

## Demo

* Producción: *agregar URL de Vercel*
* Repositorio: *agregar URL del repositorio*

## Desafío elegido

Este proyecto cubre una combinación de:

* **Desafío #1 — Visuales y Branding**
* **Desafío #2 — Maquetado**

No se implementa el Desafío #3 de infraestructura, autenticación o alta disponibilidad. El foco del entregable está en la experiencia visual, la presentación de datos y la calidad del maquetado.

## Propuesta

La landing presenta una ficha visual de equipo para que el usuario pueda entender rápidamente el contexto competitivo de cada club sin depender de una tabla extensa.

Incluye:

* selector por **Zona Norte** y **Zona Sur**
* ficha principal del equipo seleccionado
* logotipo del club seleccionado
* récord de temporada y porcentaje de victorias
* posición por división y liga
* racha actual
* rendimiento de los últimos 10 juegos
* diferencial de carreras
* carreras anotadas y permitidas
* desempeño como local y visitante
* desempeño por día y noche cuando el API lo devuelve
* pulso de división y comparativo contra el líder de zona

## Fuente de datos

La información se consume desde el API público de MLB Stats para standings de la Liga Mexicana de Beisbol 2026:

```txt
https://statsapi.mlb.com/api/v1/standings?leagueId=125&season=2026
```

## Criterio técnico

### HTML, CSS y JavaScript vanilla

Consideré que el alcance podía resolverse sin framework porque el proyecto es una landing estática con una sola fuente de datos y un flujo de interacción acotado.

Opté por **JavaScript vanilla** para mantener el entregable simple, portable y fácil de revisar por cualquier persona del equipo.

### CSS con custom properties

Se usaron variables CSS para centralizar colores, radios, sombras, espacios y tipografías. Esto permite ajustar el look & feel de la landing sin reescribir componentes completos.

### Clases con criterio BEM

Se eligió una nomenclatura cercana a BEM para mantener jerarquía clara entre bloques, elementos y modificadores.

Esto ayuda a que componentes como `profile`, `team-chips`, `division-toggle`, `bar-card` y `site-footer` sean fáciles de ubicar, modificar y extender.

### Módulos de JavaScript

La lógica se separó por responsabilidad:

```txt
api.js          → consumo del endpoint
mappers.js      → normalización de datos del API
formatters.js   → formato de porcentajes, récords y números
animations.js   → animación de números y barras
team-assets.js  → biblioteca centralizada de logotipos de equipos
app.js          → estado de UI y renderizado
```

Esta separación evita concentrar toda la lógica en un solo archivo y facilita revisar cada decisión de forma aislada.

## Decisiones de diseño

* Se priorizó una experiencia tipo landing/ficha editorial sobre una tabla de standings tradicional.
* Se tomó como referencia el sistema visual de la LMB: fondo claro, superficies blancas, azul institucional, navegación superior, footer y tarjetas con sombra ligera.
* Se integró una biblioteca de logotipos para reforzar identidad de cada equipo sin convertir la UI en una lista pesada de imágenes.
* El selector de equipos se organiza por zona para reducir ruido visual.
* Los rankings se muestran con menor peso visual para no competir con el nombre del equipo.
* Se mantuvo el formato beisbolero de `PCT` como `.559`.
* Los porcentajes visuales se redondean para mejorar lectura.
* Las barras y números relevantes tienen animación consistente.
* Se respeta `prefers-reduced-motion` para usuarios que prefieren reducir movimiento.

## Deploy

Consideré dos opciones para publicación:

* **GitHub Pages**, por ser simple y estar integrado al repositorio.
* **Vercel**, por ofrecer una URL pública inmediata, previews por rama/PR y despliegue automático conectado a GitHub.

Opté por **Vercel** para la presentación porque reduce fricción para validar el entregable, permite compartir una URL limpia y mantiene el flujo de revisión conectado al Pull Request.

El proyecto no requiere build. Se publica como sitio estático desde la raíz del repositorio.

## Calidad y flujo de trabajo

Se trabajó en una rama separada y se abrió un Pull Request hacia `main` para mantener un flujo de trabajo profesional, trazable y revisable.

Los commits se normalizaron con **Conventional Commits**, por ejemplo:

```txt
chore: initialize LMB landing structure
feat: align team selector with LMB visual system
feat: add division pulse comparison
feat: align landing shell with LMB visual system
feat: add team logos and polish presentation docs
```

Este enfoque permite revisar el avance por bloques claros y mantener `main` como una versión estable/publicable.

## Estructura del proyecto

```txt
.
├── index.html
├── README.md
├── .gitignore
├── .github/
│   └── pull_request_template.md
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
└── src/
    ├── css/
    │   └── styles.css
    └── js/
        ├── animations.js
        ├── api.js
        ├── app.js
        ├── formatters.js
        ├── mappers.js
        └── team-assets.js
```

## Notas de producción

Para un escenario real con login, alta disponibilidad y 25,000 visitas por hora, este landing debería evolucionar hacia una arquitectura con CDN, autenticación administrada, cache del API, fallback de datos, monitoreo y despliegue automatizado.

Esa parte queda fuera del alcance implementado porque el desafío seleccionado se centra en visuales, branding y maquetado.
