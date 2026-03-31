# Thiaron — Juego Educativo

Un juego educativo HTML5 + Phaser 3 para niños de **4 a 10 años**, completamente responsivo (tablet y móvil).

## 🎮 Juegos incluidos

| Juego | Edades | Descripción |
|---|---|---|
| 🔤 Abecedario | 4-7 | Explorar letras (4-5) o adivinar la letra inicial (6-7) |
| 📖 Palabras | 4-10 | Relacionar emoji con la palabra española correcta |
| ➕ Matemáticas | 4-10 | Sumas y restas adaptadas a la edad |
| ✖️ Tablas | 6-10 | Tablas de multiplicar con recompensas de balones de fútbol |
| ⚽ Fútbol | 6-10 | Mini-juego: dispara al portero con los balones ganados |
| 🇬🇧 Inglés | 8-10 | Aprende palabras básicas en inglés |

## 🏆 Sistema de recompensas

- **Tablas de multiplicar**: cada 3 respuestas correctas seguidas → 🥅 **1 balón de fútbol**
- Acumula **3 o más balones** para desbloquear el mini-juego de fútbol en el Hub
- **Rachas de fuego** 🔥: aciertos consecutivos en cualquier juego
- **Estrellas** ⭐ al terminar cada partida según el porcentaje de aciertos

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

## 🔖 Versionado automático

Con cada push a `main` el workflow de despliegue:

1. Lee la versión actual de `src/version.js` (constante `APP_VERSION`).
2. Incrementa el número de **patch** (p. ej. `1.1.0` → `1.1.1`).
3. Guarda el cambio en `src/version.js`, hace un commit automático con el mensaje `chore: bump version to X.Y.Z [skip ci]` y crea el tag `vX.Y.Z`.
4. Despliega en GitHub Pages con la nueva versión ya incluida.

El sufijo `[skip ci]` en el mensaje de commit evita que el push del bot dispare una nueva ejecución del workflow (sin loops). Si por alguna razón el workflow se ejecuta igualmente, la condición `github.actor != 'github-actions[bot]'` impide que el paso de bump se vuelva a ejecutar.

> La versión se almacena únicamente en **`src/version.js`**. `BootScene.js` la usa para detectar cambios de versión y limpiar cachés automáticamente.

## 📚 Documentación

| Documento | Descripción |
|---|---|
| [docs/how-to-run.md](docs/how-to-run.md) | Cómo ejecutar el juego localmente (Python, Node.js, VS Code, GitHub Pages) |
| [docs/adding-a-new-game.md](docs/adding-a-new-game.md) | Guía paso a paso para crear y registrar un nuevo módulo de juego |

## 📁 Estructura del proyecto

```
index.html                        ← Entrada principal
.github/
  workflows/
    deploy.yml                    ← CI/CD: bump versión patch + publica en GitHub Pages al hacer push a main
docs/
  how-to-run.md                   ← Cómo ejecutar el juego localmente
  adding-a-new-game.md            ← Guía para añadir un nuevo juego
src/
  css/style.css                   ← Estilos responsivos
  GameState.js                    ← Estado compartido (edad, puntuación, balones)
  game.js                         ← Configuración Phaser 3
  phaser.min.js                   ← Phaser 3.60.0 (local)
  scenes/
    BootScene.js                  ← Arranque
    MenuScene.js                  ← Selección de grupo de edad
    HubScene.js                   ← Selector de juegos por edad
    MultiplicationScene.js        ← Tablas de multiplicar
    SoccerScene.js                ← Mini-juego de fútbol
    AlphabetScene.js              ← Abecedario
    WordsScene.js                 ← Palabras en español
    EnglishScene.js               ← Palabras en inglés (8-10)
    MathScene.js                  ← Sumas y restas
```

## 🛠 Tecnologías

- **HTML5** + CSS3
- **[Phaser 3](https://phaser.io/)** v3.60 (incluido localmente en `src/phaser.min.js`)
- Sin dependencias adicionales ni proceso de compilación
- Gráficos dibujados programáticamente (sin archivos de imagen externos)

## 📱 Compatibilidad

Diseñado para funcionar en:
- Tabletas (landscape/portrait)
- Móviles (portrait)
- Ordenadores de escritorio

El canvas se adapta automáticamente con `Phaser.Scale.FIT`.
