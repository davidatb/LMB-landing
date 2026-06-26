# LMB 2026 · Ficha visual de equipo

Landing page estática para visualizar posiciones y estadísticas de equipos de la Liga Mexicana de Beisbol durante la temporada 2026.

El proyecto toma como referencia una primera prueba funcional y la convierte en una experiencia visual más clara, editorial y orientada a fans, manteniendo una implementación sencilla con HTML, CSS y JavaScript vanilla.

## Desafío elegido

Este entregable cubre una combinación de:

- Desafío #1 — Visuales y Branding
- Desafío #2 — Maquetado

No implementa el Desafío #3 de infraestructura, autenticación o alta disponibilidad. Se incluye una nota de producción al final para explicar cómo podría evolucionar si el landing pasara a un entorno real.

## Objetivo

Convertir una vista funcional de datos en una ficha visual de equipo que permita entender rápidamente:

- récord de ganados y perdidos
- porcentaje de victorias
- posición por división y liga
- racha actual
- rendimiento de los últimos 10 juegos
- diferencial de carreras
- carreras anotadas y permitidas
- desempeño en casa y visitante
- desempeño por día y noche cuando el API lo devuelve

## Stack

- HTML
- CSS con custom properties
- Clases CSS con criterio BEM
- JavaScript vanilla
- Fetch API
- GitHub Pages desde `/root`

## Estructura

```txt
.
├── index.html
├── README.md
├── .gitignore
├── .github/
│   └── pull_request_template.md
├── assets/
│   └── icons/
│       └── favicon.svg
└── src/
    ├── css/
    │   └── styles.css
    └── js/
        ├── animations.js
        ├── api.js
        ├── app.js
        ├── formatters.js
        └── mappers.js
```

## Fuente de datos

La información se consume desde el API público de MLB Stats para standings de la Liga Mexicana de Beisbol 2026.

```txt
https://statsapi.mlb.com/api/v1/standings?leagueId=125&season=2026
```

## Decisiones de diseño

- Se priorizó una ficha visual de equipo sobre una tabla extensa.
- El selector muestra una división a la vez para reducir ruido visual.
- Se mantuvo el formato beisbolero de `PCT` como `.407`.
- Los porcentajes visuales de barras se muestran redondeados para mejorar lectura.
- Los últimos 10 juegos se muestran como balance visual cuando el API solo entrega agregado, no secuencia cronológica.
- Las barras y números relevantes tienen animación consistente.
- Se respeta `prefers-reduced-motion` para usuarios que prefieren reducir movimiento.
- No se usan logos oficiales ni assets propietarios dentro del repositorio.

## Cómo ejecutar localmente

Desde la raíz del proyecto:

```bash
python -m http.server 8080
```

Luego abrir:

```txt
http://localhost:8080
```

También puedes usar cualquier servidor estático local, por ejemplo la extensión Live Server de VS Code.

## Deploy en GitHub Pages

El proyecto está preparado para publicarse desde la raíz del repositorio.

Pasos sugeridos:

1. Mergear el PR estable a `main`.
2. Ir a `Settings > Pages` en GitHub.
3. Seleccionar `Deploy from a branch`.
4. Elegir `main` y carpeta `/root`.
5. Guardar.

## Flujo de trabajo

Rama principal:

```txt
main = estable / publicado
```

Ramas de trabajo:

```txt
feature/lmb-visual-maquetado
fix/nombre-del-fix
```

Comandos útiles:

```bash
git checkout main
git pull origin main
git checkout -b feature/lmb-visual-maquetado
```

Antes de abrir PR:

```bash
git fetch origin main
git diff --stat origin/main...HEAD
git diff --name-status origin/main...HEAD
git status --short
```

## Validación manual

Antes de cerrar el entregable se valida que:

- la página cargue correctamente
- el API responda y los datos se rendericen
- exista estado de error si el API falla
- el selector de división funcione
- el selector de equipo funcione
- el cambio de equipo actualice todas las métricas
- las animaciones funcionen de forma consistente
- el diseño sea usable en mobile y desktop
- no existan errores en consola
- no se suban archivos temporales, secretos, zips, patches o diffs

## Notas de producción

Para un escenario real con login, alta disponibilidad y 25,000 visitas por hora, este sitio debería evolucionar hacia una arquitectura con:

- CDN
- autenticación administrada
- cache del API
- fallback de datos
- monitoreo
- despliegue automatizado
- control de errores y observabilidad

Esa parte queda fuera del scope de este entregable porque el foco seleccionado es visuales y maquetado.
