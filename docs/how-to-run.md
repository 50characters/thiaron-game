# Cómo ejecutar Thiaron localmente

El juego es una aplicación HTML5 pura que **no necesita compilación ni instalación de dependencias**. Solo necesitas servir los archivos desde un servidor HTTP local (los navegadores bloquean algunas funcionalidades cuando abres el archivo directamente con `file://`).

---

## Requisitos previos

Cualquier opción de las siguientes es suficiente:

| Herramienta | Requisito |
|---|---|
| Python 3 | Incluido en macOS/Linux; [descarga](https://python.org) para Windows |
| Node.js | [descarga](https://nodejs.org) |
| VS Code | Extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) |

---

## Opción 1 — Python 3 (recomendado)

```bash
# Desde la raíz del repositorio:
python3 -m http.server 8080
```

Abre el navegador en: **http://localhost:8080**

---

## Opción 2 — Node.js con `npx serve`

```bash
# Desde la raíz del repositorio:
npx serve .
```

El comando imprimirá la URL local, normalmente **http://localhost:3000**.

> `npx` ya viene incluido con Node.js ≥ 5.2. No hace falta instalar nada más.

---

## Opción 3 — VS Code Live Server

1. Instala la extensión **Live Server** desde el marketplace de VS Code.
2. Abre la carpeta del repositorio en VS Code.
3. Haz clic en **"Go Live"** en la barra de estado inferior derecha.
4. El navegador se abrirá automáticamente.

---

## Opción 4 — GitHub Pages (producción)

El repositorio incluye un workflow de GitHub Actions que publica el juego automáticamente en GitHub Pages en cada push a `main`.

URL del juego publicado: `https://<usuario>.github.io/thiaron-game/`

Consulta [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) para más detalles.

---

## Compatibilidad de navegadores

| Navegador | Estado |
|---|---|
| Chrome / Edge 90+ | ✅ Recomendado |
| Firefox 88+ | ✅ Compatible |
| Safari 14+ | ✅ Compatible |
| Chrome en Android | ✅ Compatible |
| Safari en iOS 14+ | ✅ Compatible |

El canvas se adapta automáticamente a la pantalla (`Scale.FIT`) tanto en portrait como en landscape.

---

## Estructura de ficheros relevante

```
thiaron-game/
├── index.html            ← Punto de entrada; abrir este fichero
├── src/
│   ├── phaser.min.js     ← Phaser 3.60.0 (incluido localmente, sin CDN)
│   ├── GameState.js      ← Estado global compartido entre escenas
│   ├── game.js           ← Configuración de Phaser
│   ├── css/
│   │   └── style.css     ← Estilos responsivos
│   └── scenes/           ← Una escena por juego/pantalla
│       ├── BootScene.js
│       ├── MenuScene.js
│       ├── HubScene.js
│       ├── MultiplicationScene.js
│       ├── SoccerScene.js
│       ├── AlphabetScene.js
│       ├── WordsScene.js
│       ├── EnglishScene.js
│       └── MathScene.js
└── docs/
    ├── how-to-run.md     ← Este documento
    └── adding-a-new-game.md
```
