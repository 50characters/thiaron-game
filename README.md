# Thiaron — Juego Educativo

Un juego educativo HTML5 + Phaser 3 para niños de **4 a 10 años**, completamente responsivo (tablet y móvil).

> 🤖 **Todo el desarrollo de este proyecto ha sido realizado íntegramente con Agentes de Inteligencia Artificial (GitHub Copilot Coding Agent).**

## 🎮 Juegos incluidos

| Juego | Edades | Descripción |
|---|---|---|
| 🔤 Abecedario | 4-7 | Explorar letras (4-5) o adivinar la letra inicial (6-7) |
| 📖 Palabras | 4-10 | Relacionar emoji con la palabra española correcta |
| ➕ Matemáticas | 4-10 | Sumas y restas adaptadas a la edad |
| ✖️ Tablas | 6-10 | Tablas de multiplicar con recompensas de balones |
| ⚽ Fútbol | 6-10 | Mini-juego: dispara al portero con los balones ganados |
| 🏀 Baloncesto | 6-10 | Mini-juego: toca el balón en movimiento para encestar |
| 🇬🇧 Inglés | 8-10 | Aprende palabras básicas en inglés |

## 🏆 Sistema de recompensas

- **Tablas de multiplicar y Matemáticas**: cada 3 respuestas correctas seguidas → 🥅 **1 balón**
- Acumula **3 o más balones** para desbloquear el mini-juego deportivo en el Hub
- Elige entre **⚽ Fútbol** o **🏀 Baloncesto** al canjear tus balones
- **Rachas de fuego** 🔥: aciertos consecutivos en cualquier juego
- **Estrellas** ⭐ al terminar cada partida según el porcentaje de aciertos
- El portero en **Fútbol** tiene mayor dificultad para el grupo de **8-10 años**

## 💾 Sistema de guardado y versiones

- La partida se **guarda automáticamente** en `localStorage` al entrar al Hub (edad, puntuación, balones acumulados)
- Al volver al juego, la sesión anterior se restaura directamente en el Hub
- La versión actual se muestra en la pantalla de inicio
- Al publicar una nueva versión, la caché del Service Worker se limpia automáticamente para evitar conflictos con assets obsoletos

## 📲 Instalación como app (PWA)

Thiaron es una **Progressive Web App**: puedes instalarlo en tablets y móviles como si fuera una app nativa.

1. Abre el juego en **Chrome / Safari** en tu dispositivo
2. Pulsa el botón *"Añadir a pantalla de inicio"* (o el icono de instalación en la barra del navegador)
3. El juego se abrirá en modo pantalla completa, sin barra de navegación

## 🚀 Cómo ejecutar

Consulta la guía completa en **[docs/how-to-run.md](docs/how-to-run.md)**.

Inicio rápido:

```bash
# Python
python3 -m http.server 8080
# → http://localhost:8080

# Node.js
npx serve .
```

El juego también se publica automáticamente en **GitHub Pages** tras cada push a `main` mediante el workflow `.github/workflows/deploy.yml`.

## 📚 Documentación

| Documento | Descripción |
|---|---|
| [docs/how-to-run.md](docs/how-to-run.md) | Cómo ejecutar el juego localmente (Python, Node.js, VS Code, GitHub Pages) |
| [docs/adding-a-new-game.md](docs/adding-a-new-game.md) | Guía paso a paso para crear y registrar un nuevo módulo de juego |

## 📁 Estructura del proyecto

```
index.html                        ← Entrada principal
manifest.json                     ← Manifiesto PWA
sw.js                             ← Service Worker (caché offline)
icons/                            ← Iconos PWA (192×192 y 512×512)
.github/
  workflows/
    deploy.yml                    ← CI/CD: publica en GitHub Pages al hacer push a main
docs/
  how-to-run.md                   ← Cómo ejecutar el juego localmente
  adding-a-new-game.md            ← Guía para añadir un nuevo juego
src/
  css/style.css                   ← Estilos responsivos
  version.js                      ← Versión de la app (APP_VERSION)
  GameState.js                    ← Estado compartido (edad, puntuación, balones, guardado)
  game.js                         ← Configuración Phaser 3
  phaser.min.js                   ← Phaser 3.60.0 (local)
  scenes/
    BootScene.js                  ← Arranque, gestión de versión y caché
    MenuScene.js                  ← Selección de grupo de edad
    HubScene.js                   ← Selector de juegos por edad
    MultiplicationScene.js        ← Tablas de multiplicar
    MathScene.js                  ← Sumas y restas
    AlphabetScene.js              ← Abecedario
    WordsScene.js                 ← Palabras en español
    EnglishScene.js               ← Palabras en inglés (8-10)
    SoccerScene.js                ← Mini-juego de fútbol
    BasketballScene.js            ← Mini-juego de baloncesto
```

## 🛠 Tecnologías

- **HTML5** + CSS3
- **[Phaser 3](https://phaser.io/)** v3.60 (incluido localmente en `src/phaser.min.js`)
- **Service Worker** + **Web App Manifest** para soporte PWA
- Sin dependencias adicionales ni proceso de compilación
- Gráficos dibujados programáticamente (sin archivos de imagen externos)

## 📱 Compatibilidad

Diseñado para funcionar en:
- Tabletas (landscape/portrait)
- Móviles (portrait)
- Ordenadores de escritorio

El canvas se adapta automáticamente con `Phaser.Scale.FIT`.
